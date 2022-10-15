import Hammer from "hammerjs";

import {DRAG_TIME,
        LEFT_MOUSE_BUTTON,
        MIDDLE_MOUSE_BUTTON} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {CalculateMidpoint} from "math/MathUtils";

import {Key}        from "./Key";
import {Observable} from "./Observable";


export type MouseInputEvent = {
    type: "click" | "dblclick" | "mousedown" | "mousedrag" | "mouseup";
    button: number;
}
export type KeyboardInputEvent = {
    type: "keydown" | "keyup";
    key: Key;
}
export type ZoomInputEvent = {
    type: "zoom";
    factor: number;
    pos: Vector;
}
export type CopyPasteInputEvent = {
    type: "paste" | "copy" | "cut";
    ev: ClipboardEvent;
}
export type OtherInputEvent = {
    type: "mouseenter" | "mousemove" | "mouseleave" | "contextmenu" | "unknown";
}

export type InputManagerEvent =
    MouseInputEvent | KeyboardInputEvent | ZoomInputEvent | CopyPasteInputEvent | OtherInputEvent;
export type InputManagerEventType = InputManagerEvent["type"];


/**
 * Class to handle user input, and trigger appropriate event listeners.
 */
export class InputManager extends Observable<InputManagerEvent> {
    /** Amount of time a mousebutton needs to be held down to be considered a "drag" (rather than a "click"). */
    private readonly dragTime: number;

    /** The canvas the user is performing inputs on. */
    private canvas?: HTMLCanvasElement;

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

    /** Map with keycodes as keys and booleans representing whether that key is held as values. */
    private keysDown: Map<Key, boolean>;

    /**
     * Initializes Input with given canvas and dragTime.
     *
     * @param dragTime The minimum length of time a mousedown must last to be considered a drag rather than a click.
     */
    public constructor(dragTime: number = DRAG_TIME) {
        super();
        this.dragTime = dragTime;
        this.reset();
    }

    /**
     * Set ups event listeners on the given canvas and returns a tear down callback.
     *
     * @param canvas The canvas to setup on.
     * @returns        A callback that tears down the setup event listeners.
     * @throws If the canvas was already setup and not torn down.
     */
    public setupOn(canvas: HTMLCanvasElement): () => void {
        if (this.canvas)
            throw new Error("Attempted to setup Input when previously setup! This is undefined behaviour!");

        this.canvas = canvas;

        const tearDownKeyboardEvents = this.hookupKeyboardEvents();
        const tearDownMouseEvents    = this.hookupMouseEvents(canvas);
        const tearDownTouchEvents    = this.hookupTouchEvents(canvas);
        const tearDownHammer         = this.setupHammer(canvas);

        return () => {
            tearDownHammer();
            tearDownTouchEvents();
            tearDownMouseEvents();
            tearDownKeyboardEvents();

            this.canvas = undefined;
        }
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
     *
     * @returns A callback to tear down these event listeners.
     * @throws If canvas is undefined.
     */
    private hookupKeyboardEvents(): () => void {
        if (!this.canvas)
            throw new Error("Input: Attempted to hookup keyboard events before a canvas was set!");

        const onKeyDown = (e: KeyboardEvent) => {
            // Check for "Alt" to fix issue #943
            if (e.key === "Alt" || !(document.activeElement instanceof HTMLInputElement)) {
                this.onKeyDown(e.key as Key);

                if (this.isPreventedCombination(e.key as Key))
                    e.preventDefault();
            }
        }
        const onKeyUp = (e: KeyboardEvent) => {
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
        }
        const onBlur = () => this.onBlur();

        const onPaste = (ev: ClipboardEvent) => this.publish({ type: "paste", ev });
        const onCopy  = (ev: ClipboardEvent) => this.publish({ type: "copy",  ev });
        const onCut   = (ev: ClipboardEvent) => this.publish({ type: "cut",   ev });


        window.addEventListener("keydown", onKeyDown, false);
        window.addEventListener("keyup",   onKeyUp,   false);
        window.addEventListener("blur",    onBlur);
        window.addEventListener("paste",   onPaste);
        window.addEventListener("copy",    onCopy);
        window.addEventListener("cut",     onCut);

        return () => {
            window.removeEventListener("cut",     onCut);
            window.removeEventListener("copy",    onCopy);
            window.removeEventListener("paste",   onPaste);
            window.removeEventListener("blur",    onBlur);
            window.removeEventListener("keyup",   onKeyUp,   false);
            window.removeEventListener("keydown", onKeyDown, false);
        }
    }

    /**
     * Sets up Listeners for mouse Events.
     *
     * @param canvas The canvas to attach the event listeners to.
     * @returns        A callback to tear down these event listeners.
     */
    private hookupMouseEvents(canvas: HTMLCanvasElement): () => void {
        const onMouseDown = (e: MouseEvent) => {
            this.onMouseDown(V(e.clientX, e.clientY), e.button);

            // Fixes issue #777, stops Firefox from scrolling and allows panning
            if (e.button === MIDDLE_MOUSE_BUTTON)
                e.preventDefault();
        };

        const onClick      = (e: MouseEvent) => this.onClick(V(e.clientX, e.clientY), e.button);
        const onDblClick   = (e: MouseEvent) => this.onDoubleClick(e.button);
        const onMouseUp    = (e: MouseEvent) => this.onMouseUp(e.button);
        const onMouseMove  = (e: MouseEvent) => this.onMouseMove(V(e.clientX, e.clientY));
        const onMouseEnter = (_: MouseEvent) => this.onMouseEnter();
        const onMouseLeave = (_: MouseEvent) => this.onMouseLeave();
        const onWheel      = (e: WheelEvent) => this.onScroll(e.deltaY);

        const onContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            this.publish({ type: "contextmenu" });
        }

        // Mouse events
        canvas.addEventListener("click",       onClick,      false);
        canvas.addEventListener("dblclick",    onDblClick,   false);
        canvas.addEventListener("wheel",       onWheel,      false);
        canvas.addEventListener("mousedown",   onMouseDown,  false);
        canvas.addEventListener("mouseup",     onMouseUp,    false);
        canvas.addEventListener("mousemove",   onMouseMove,  false);
        canvas.addEventListener("mouseenter",  onMouseEnter, false);
        canvas.addEventListener("mouseleave",  onMouseLeave, false);
        canvas.addEventListener("contextmenu", onContextMenu);

        return () => {
            canvas.removeEventListener("contextmenu", onContextMenu);
            canvas.removeEventListener("mouseleave",  onMouseLeave, false);
            canvas.removeEventListener("mouseenter",  onMouseEnter, false);
            canvas.removeEventListener("mousemove",   onMouseMove,  false);
            canvas.removeEventListener("mouseup",     onMouseUp,    false);
            canvas.removeEventListener("mousedown",   onMouseDown,  false);
            canvas.removeEventListener("wheel",       onWheel,      false);
            canvas.removeEventListener("dblclick",    onDblClick,   false);
            canvas.removeEventListener("click",       onClick,      false);
        }
    }

    /**
     * Sets up Listeners for touch events.
     *
     * @param canvas The canvas to attach the event listeners to.
     * @returns        A callback to tear down these event listeners.
     */
    private hookupTouchEvents(canvas: HTMLCanvasElement): () => void {
        const getTouchPositions = (touches: TouchList): Vector[] => [...touches].map((t) => V(t.clientX, t.clientY));

        const onTouchStart = (e: TouchEvent) => {
            this.onTouchStart(getTouchPositions(e.touches));
            e.preventDefault();
        }
        const onTouchMove = (e: TouchEvent) => {
            this.onTouchMove(getTouchPositions(e.touches));
            e.preventDefault();
        }
        const onTouchEnd = (e: TouchEvent) => {
            this.onTouchEnd();
            e.preventDefault();
        }

        canvas.addEventListener("touchstart", onTouchStart, false);
        canvas.addEventListener("touchmove",  onTouchMove,  false);
        canvas.addEventListener("touchend",   onTouchEnd,   false);

        return () => {
            canvas.removeEventListener("touchend",   onTouchEnd,   false);
            canvas.removeEventListener("touchmove",  onTouchMove,  false);
            canvas.removeEventListener("touchstart", onTouchStart, false);
        }
    }

    /**
     * Sets up touchManagers for pinching and tapping.
     *
     * @param canvas The canvas to attach the event listeners to.
     * @returns        A callback to tear down these event listeners.
     */
    private setupHammer(canvas: HTMLCanvasElement): () => void {
        let lastScale = 1;

        // Used for pinch to zoom
        const pinch = new Hammer.Pinch();
        const onPinch = (e: HammerInput) => {
            this.publish({
                type:   "zoom",
                factor: lastScale/e.scale,
                pos:    this.mousePos,
            });
            lastScale = e.scale;
        }
        const onPinchEnd = (_: HammerInput) => {
            lastScale = 1;
        }

        const tap = new Hammer.Tap();
        const onTap = (e: HammerInput) => {
            if (e.pointerType === "mouse")
                return;

            this.onClick(V(e.center.x, e.center.y));
        }

        // Used to prevent default zoom in gesture for all browsers. Fixes #745.
        const onWheel = (e: WheelEvent) => {
            if (e.ctrlKey)
                e.preventDefault();
        }


        const touchManager = new Hammer.Manager(canvas, { recognizers: [], domEvents: true });
        touchManager.add(pinch);
        touchManager.on("pinch", onPinch);
        touchManager.on("pinchend", onPinchEnd);
        touchManager.add(tap);
        touchManager.on("tap", onTap);
        document.addEventListener("wheel", onWheel, { passive: false });

        return () => {
            document.removeEventListener("wheel", onWheel);

            touchManager.off("tap", onTap);
            touchManager.remove(tap);
            touchManager.off("pinchend", onPinchEnd);
            touchManager.off("pinch", onPinch);
            touchManager.remove(pinch);
            touchManager.destroy();
        }
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

        this.keysDown = new Map();
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
        this.publish({ type: "keydown", key });
    }
    /**
     * Sets the given key as up, and calls each Listener on Event "keyup", key.
     *
     * @param key Represents the key being released.
     */
    protected onKeyUp(key: Key): void {
        this.keysDown.set(key.toLowerCase() as Key, false); // Lower case so that letters are the same despite SHIFT

        // call each listener
        this.publish({ type: "keyup", key });
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
        this.publish({ type: "click", button });
    }
    /**
     * Calls each Listener on Event "dbclick", button.
     *
     * @param button Represents the mouse button being double clicked.
     */
    protected onDoubleClick(button: number): void {

        // call each listener
        this.publish({ type: "dblclick", button });
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

        this.publish({
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
     * @throws If canvas is undefined.
     */
    protected onMouseDown(pos: Vector, button = 0): void {
        if (!this.canvas)
            throw new Error("Input: Attempted to call onMouseDown before a canvas was set!");

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

        this.publish({ type: "mousedown", button });
    }
    /**
     * Triggered on mouse movement, calculates new mouse position,
     * and triggers Listeners on Event "mousemove", as well as Listeners
     * on Event "mousedrag", [current mouse button down] if the user is clicking.
     *
     * @param pos Represents the new absolute position of the mouse.
     * @throws If canvas is undefined.
     */
    protected onMouseMove(pos: Vector): void {
        if (!this.canvas)
            throw new Error("Input: Attempted to call onMouseMove before a canvas was set!");

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
            this.publish({
                type:   "mousedrag",
                button: this.mouseDownButton,
            });
        }
        this.publish({ type: "mousemove" });
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

        this.publish({ type: "mouseup", button });
    }

    /**
     * Calls each Listener on Event "mouseenter".
     */
    protected onMouseEnter(): void {
        this.publish({ type: "mouseenter" });
    }
    /**
     * Calls each Listener on Event "mouseleave".
     * Also calls on Event "mouseup", [current mouse button down].
     */
    protected onMouseLeave(): void {
        this.touchCount = 0;
        this.mouseDown = false;

        this.publish({ type: "mouseleave" });

        // call mouse up as well so that
        //  up events get called when the
        //  mouse leaves
        this.publish({
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
}
