import Hammer from "hammerjs";

import {DRAG_TIME,
        LEFT_MOUSE_BUTTON,
        MIDDLE_MOUSE_BUTTON} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {CalculateMidpoint} from "math/MathUtils";

import {Event} from "./Events";
import {Key}   from "./Key";


export type Listener = (event: Event) => void;

/**
 * Class to handle user input, and trigger appropriate event listeners.
 */
export class Input {
    /** The canvas the user is performing inputs on. */
    private readonly canvas: HTMLCanvasElement;
    /** A vector representing the previous position of the mouse. */
    private prevMousePos: Vector;
    /** A vector representing the current position of the mouse. */
    private mousePos: Vector;

    /** True if a mousebutton is held down, false otherwise. */
    private mouseDown: boolean;
    /** A vector representing the position the mouse was when the mousebutton first became pressed. */
    private mouseDownPos: Vector;
    /** Represents the mousebutton being pressed (left, middle, right, etc.). */
    private mouseDownButton: number;

    /** True if the mouse is being dragged, false otherwise. (a "drag" being distinct from a "click"). */
    private isDragging: boolean;
    /** Represents the time at which the mouse button became held down. */
    private startTapTime: number;

    /** Represents the number of touches currently active (i.e. fingers on a touchpad or mobile device). */
    private touchCount: number;

    /** Stores the Listeners for events that may be triggered by user input. */
    private readonly listeners: Listener[];
    /** Map with keycodes as keys and booleans representing whether that key is held as values. */
    private keysDown: Map<Key, boolean>;

    /** Amount of time a mousebutton needs to be held down to be considered a "drag" (rather than a "click"). */
    private readonly dragTime: number;

    /** If true, "blocks" Input, stopping listeners from triggering events. */
    private blocked: boolean;

    /**
     * Initializes Input with given canvas and dragTime.
     *
     * @param canvas   The canvas input is being applied to.
     * @param dragTime The minimum length of time a mousedown must last to be considered a drag rather than a click.
     */
    public constructor(canvas: HTMLCanvasElement, dragTime: number = DRAG_TIME) {
        this.canvas = canvas;
        this.dragTime = dragTime;
        this.blocked = false;
        this.listeners = [];

        this.reset();

        this.hookupKeyboardEvents();
        this.hookupMouseEvents();
        this.hookupTouchEvents();
        this.setupHammer();
    }

    /**
     * Checks if newKey is a prevented combination of keys.
     *
     * @param newKey Represents the key combination being pressed.
     * @returns        True if newKey is a prevented combination, false otherwise.
     */
    private isPreventedCombination(newKey: Key): boolean {
        // Some browsers map shorcuts (for example - to CTRL+D but we use it to duplicate elements)
        //  So we need to disable some certain combinations of keys
        const PREVENTED_COMBINATIONS = [
            [["s"], ["Control", "Meta"]],
            [["d"], ["Control", "Meta"]],
            [["z"], ["Control", "Meta"]],
            [["y"], ["Control", "Meta"]],
            [["Backspace"]],
            [["Alt"]],   // Needed because Alt on Chrome on Windows/Linux causes page to lose focus
        ] as Key[][][];

        // Check if some combination has every key pressed and newKey is one of them
        //  and return true if that's the case
        return PREVENTED_COMBINATIONS.some((combination) => (
            combination.flat().includes(newKey) &&
            combination.every((keys) => (
                keys.some((key) => this.isKeyDown(key))
            ))
        ));
    }

    /**
     * Sets up Listeners for all keyboard Events.
     */
    private hookupKeyboardEvents(): void {
        // Keyboard events
        window.addEventListener("keydown", (e) => {
            // Check for "Alt" to fix issue #943
            if (e.key === "Alt" || !(document.activeElement instanceof HTMLInputElement)) {
                this.onKeyDown(e.key as Key);

                if (this.isPreventedCombination(e.key as Key))
                    e.preventDefault();
            }
        }, false);
        window.addEventListener("keyup",   (e) => {
            // Check for "Alt" to fix issue #943
            if (e.key === "Alt" || !(document.activeElement instanceof HTMLInputElement))
                this.onKeyUp(e.key as Key);

            // Check for Meta key and release all other keys on up
            //  See https://stackoverflow.com/q/27380018/5911675
            if (e.key === "Meta") {
                [...this.keysDown.entries()]
                    .filter(([_,down]) => down)
                    .map(([k]) => k)
                    .forEach((k) => this.onKeyUp(k));
            }
        }, false);

        window.addEventListener("blur", (_) => this.onBlur());

        window.addEventListener("paste", (ev: ClipboardEvent) => this.callListeners({ type: "paste", ev }));
        window.addEventListener("copy",  (ev: ClipboardEvent) => this.callListeners({ type: "copy",  ev }));
        window.addEventListener("cut",   (ev: ClipboardEvent) => this.callListeners({ type: "cut",   ev }));
    }

    /**
     * Sets up Listeners for mouse Events.
     */
    private hookupMouseEvents(): void {
        // Mouse events
        this.canvas.addEventListener("click",    (e) => this.onClick(V(e.clientX, e.clientY), e.button), false);
        this.canvas.addEventListener("dblclick", (e) => this.onDoubleClick(e.button), false);
        this.canvas.addEventListener("wheel",    (e) => this.onScroll(e.deltaY), false);

        this.canvas.addEventListener("mousedown", (e) => {
            this.onMouseDown(V(e.clientX, e.clientY), e.button);

            // Fixes issue #777, stops Firefox from scrolling and allows panning
            if (e.button === MIDDLE_MOUSE_BUTTON)
                e.preventDefault();
        }, false);

        this.canvas.addEventListener("mouseup",    (e) => this.onMouseUp(e.button), false);
        this.canvas.addEventListener("mousemove",  (e) => this.onMouseMove(V(e.clientX, e.clientY)), false);
        this.canvas.addEventListener("mouseenter", (_) => this.onMouseEnter(), false);
        this.canvas.addEventListener("mouseleave", (_) => this.onMouseLeave(), false);

        this.canvas.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            this.callListeners({ type: "contextmenu" });
        });
    }

    /**
     * Sets up Listeners for touch events.
     */
    private hookupTouchEvents(): void {
        const getTouchPositions = (touches: TouchList): Vector[] => [...touches].map((t) => V(t.clientX, t.clientY));

        // Touch screen events
        this.canvas.addEventListener("touchstart", (e) => {
            this.onTouchStart(getTouchPositions(e.touches));
            e.preventDefault();
        }, false);

        this.canvas.addEventListener("touchmove", (e) => {
            this.onTouchMove(getTouchPositions(e.touches));
            e.preventDefault();
        }, false);

        this.canvas.addEventListener("touchend", (e) => {
            this.onTouchEnd();
            e.preventDefault();
        }, false);
    }

    /**
     * Sets up touchManagers for pinching and tapping.
     */
    private setupHammer(): void {
        // Pinch to zoom
        const touchManager = new Hammer.Manager(this.canvas, { recognizers: [], domEvents: true });
        let lastScale = 1;

        touchManager.add(new Hammer.Pinch());

        touchManager.on("pinch", (e) => {
            this.callListeners({
                type:   "zoom",
                factor: lastScale/e.scale,
                pos:    this.mousePos,
            });
            lastScale = e.scale;
        });

        touchManager.on("pinchend", (_) => {
            lastScale = 1;
        });

        touchManager.add(new Hammer.Tap());
        touchManager.on("tap", (e) => {
            if (e.pointerType === "mouse")
                return;

            this.onClick(V(e.center.x, e.center.y));
        });

        // This function is used to prevent default zoom in gesture for all browsers
        //  Fixes #745
        document.addEventListener("wheel",
            (e) => {
                if (e.ctrlKey)
                    e.preventDefault();
            },
            { passive: false }
        );
    }

    /**
     * Resets internal state of the Input.
     *  Keeps listeners and outer-controlled state.
     */
    public reset(): void {
        this.prevMousePos = V();
        this.mousePos = V();

        this.mouseDown = false;
        this.mouseDownPos = V();
        this.mouseDownButton = 0;

        this.isDragging = false;
        this.startTapTime = 0;

        this.touchCount = 0;

        this.keysDown  = new Map();
    }

    /**
     * Sets blocked to true, prevents Listeners from triggering Events.
     */
    public block(): void {
        this.blocked = true;
    }
    /**
     * Sets blocked to false, allows Listeners to trigger Events again.
     */
    public unblock(): void {
        this.blocked = false;
    }

    /**
     * Adds a Listener to the list of Listeners Events are checked against.
     *
     * @param listener The Listener being added.
     */
    public addListener(listener: Listener): void {
        this.listeners.push(listener);
    }

    /**
     * Removes a Listener from the list of Listeners Events are checked against.
     *
     * @param listener The Listener being removed.
     */
    public removeListener(listener: Listener): void {
        this.listeners.splice(this.listeners.indexOf(listener), 1);
    }

    /**
     * Checks if the mouse is pressed down.
     *
     * @returns True if the mouse is down, false otherwise.
     */
    public isMouseDown(): boolean {
        return this.mouseDown;
    }
    /**
     * Checks if the given key is held down.
     *
     * @param key Represents the key being checked.
     * @returns     True if key is down, false otherwise.
     */
    public isKeyDown(key: Key): boolean {
        return (this.keysDown.has(key.toLowerCase() as Key) &&
                this.keysDown.get(key.toLowerCase() as Key) === true);
    }

    /**
     * Checks if the shift key is held down.
     *
     * @returns True if the shift key is down, false otherwise.
     */
    public isShiftKeyDown(): boolean {
        return this.isKeyDown("Shift");
    }


    /**
     * Checks if the option key is held down.
     *
     * @returns True if the option key is down, false otherwise.
     */
    public isEscKeyDown(): boolean {
        return this.isKeyDown("Escape");
    }

    /**
     * Checks if the modifier key is held down.
     *
     * @returns True if the modifier key (control, command, or meta) is down, false otherwise.
     */
     public isModifierKeyDown(): boolean {
        return (this.isKeyDown("Control") || this.isKeyDown("Meta"));
    }
    /**
     * Checks if the option key is held down.
     *
     * @returns True if the option key is down, false otherwise.
     */
    public isAltKeyDown(): boolean {
        return this.isKeyDown("Alt");
    }

    /**
     * Gets the position of the cursor of the mouse.
     *
     * @returns Current position of the mouse.
     */
    public getMousePos(): Vector {
        return V(this.mousePos);
    }
    /**
     * Gets the position where the mouse was pressed down.
     *
     * @returns Current position of the mouse down.
     */
    public getMouseDownPos(): Vector {
        return V(this.mouseDownPos);
    }
    /**
     * Gets the difference between the current and previous mouse position.
     *
     * @returns Difference between current and previous mouse position.
     */
    public getDeltaMousePos(): Vector {
        return this.mousePos.sub(this.prevMousePos);
    }

    /**
     * Gets the number of times the mouse has been pressed.
     *
     * @returns The touchCount.
     */
    public getTouchCount(): number {
        return this.touchCount;
    }

    /**
     * Sets the given key as down, and calls each Listener on Event "keydown", key.
     *
     * @param key Represents the key being pressed.
     */
    protected onKeyDown(key: Key): void {
        this.keysDown.set(key.toLowerCase() as Key, true); // Lower case so that letters are the same despite SHIFT

        // call each listener
        this.callListeners({ type: "keydown", key });
    }
    /**
     * Sets the given key as up, and calls each Listener on Event "keyup", key.
     *
     * @param key Represents the key being released.
     */
    protected onKeyUp(key: Key): void {
        this.keysDown.set(key.toLowerCase() as Key, false); // Lower case so that letters are the same despite SHIFT

        // call each listener
        this.callListeners({ type: "keyup", key });
    }

    /**
     * Calls each Listener on Event "click", button.
     *
     * @param _      Unused position vector.
     * @param button Represents the mouse button being clicked (left mouse button by default).
     */
    protected onClick(_: Vector, button: number = LEFT_MOUSE_BUTTON): void {
        // Don't call onclick if was dragging
        if (this.isDragging) {
            this.isDragging = false;
            return;
        }

        // call each listener
        this.callListeners({ type: "click", button });
    }
    /**
     * Calls each Listener on Event "dbclick", button.
     *
     * @param button Represents the mouse button being double clicked.
     */
    protected onDoubleClick(button: number): void {

        // call each listener
        this.callListeners({ type: "dblclick", button });
    }

    /**
     * Calls each Listener on Event "zoom", zoomFactor, mousePos
     * where zoomFactor is calculated from delta.
     *
     * @param delta Represents whether the user is zooming in or out (negative and positive, respectively).
     */
    protected onScroll(delta: number): void {
        // calculate zoom factor
        let zoomFactor = 0.95;
        if (delta >= 0)
            zoomFactor = 1 / zoomFactor;

        this.callListeners({
            type:   "zoom",
            factor: zoomFactor,
            pos:    this.mousePos,
        });
    }

    /**
     * Adjusts mouse variables (dragging, position, etc.),
     * and triggers Listeners on Event "mousedown", button.
     *
     * @param pos    Represents the position of the mouse being pressed.
     * @param button Represents the mouse button being pressed (0 by default).
     */
    protected onMouseDown(pos: Vector, button = 0): void {
        const rect = this.canvas.getBoundingClientRect();

        this.touchCount++;

        // reset dragging and set mouse stuff
        this.isDragging = false;
        this.startTapTime = Date.now();
        this.mouseDown = true;
        this.mouseDownPos = pos.sub(rect.left, rect.top)
                               // Scale in case the real canvas size is different then the pixel size
                               // (i.e. image exporter)
                               .scale(V(this.canvas.width / rect.width, this.canvas.height / rect.height));

        this.mousePos = V(this.mouseDownPos);
        this.mouseDownButton = button;

        this.callListeners({ type: "mousedown", button });
    }
    /**
     * Triggered on mouse movement, calculates new mouse position,
     * and triggers Listeners on Event "mousemove", as well as Listeners
     * on Event "mousedrag", [current mouse button down] if the user is clicking.
     *
     * @param pos Represents the new absolute position of the mouse.
     */
    protected onMouseMove(pos: Vector): void {
        const rect = this.canvas.getBoundingClientRect();

        // get raw and relative mouse positions
        this.prevMousePos = V(this.mousePos);
        this.mousePos = pos.sub(rect.left, rect.top)
                           // Scale in case the real canvas size is different then the pixel size (i.e. image exporter)
                           .scale(V(this.canvas.width / rect.width, this.canvas.height / rect.height));

        // determine if mouse is dragging
        this.isDragging = (this.mouseDown &&
                           Date.now() - this.startTapTime > this.dragTime);

        if (this.isDragging) {
            this.callListeners({
                type:   "mousedrag",
                button: this.mouseDownButton,
            });
        }
        this.callListeners({ type: "mousemove" });
    }
    /**
     * Calls each Listener on Event "mouseup", button
     * and adjusts variables tracking mouse buttons.
     *
     * @param button Represents the mouse button being released (0 by default).
     */
    protected onMouseUp(button = 0): void {
        this.touchCount = Math.max(0, this.touchCount - 1); // Should never have -1 touches
        this.mouseDown = false;
        this.mouseDownButton = -1;

        this.callListeners({ type: "mouseup", button });
    }

    /**
     * Calls each Listener on Event "mouseenter".
     */
    protected onMouseEnter(): void {
        this.callListeners({ type: "mouseenter" });
    }
    /**
     * Calls each Listener on Event "mouseleave".
     * Also calls on Event "mouseup", [current mouse button down].
     */
    protected onMouseLeave(): void {
        this.touchCount = 0;
        this.mouseDown = false;

        this.callListeners({ type: "mouseleave" });

        // call mouse up as well so that
        //  up events get called when the
        //  mouse leaves
        this.callListeners({
            type:   "mouseup",
            button: this.mouseDownButton,
        });
    }

    /**
     * Calls onMouseDown for the midpoint of multiple touches.
     *
     * @param touches Represents the positions of the touches.
     */
    protected onTouchStart(touches: Vector[]): void {
        this.onMouseDown(CalculateMidpoint(touches));
    }
    /**
     * Called when a user moves a touch point (as when using a touchpad or mobile device).
     * Calls onMouseMove for the midpoint of multiple movements.
     *
     * @param touches Represents the positions of the touches.
     */
    protected onTouchMove(touches: Vector[]): void {
        this.onMouseMove(CalculateMidpoint(touches));
    }
    /**
     * Calls onMouseUp.
     */
    protected onTouchEnd(): void {
        this.onMouseUp();
    }

    /**
     * Releases each key that is down.
     */
    protected onBlur(): void {
        this.keysDown.forEach((down, key) => {
            if (down)
                this.onKeyUp(key);
        });
    }

    /**
     * Calls the Listeners in 'listeners' for Event 'event', if Input not blocked.
     *
     * @param event Event being given to the Listeners.
     */
    private callListeners(event: Event): void {
        if (this.blocked)
            return;

        for (const listener of this.listeners)
            listener(event);
    }
}
