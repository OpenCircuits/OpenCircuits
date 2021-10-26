import Hammer from "hammerjs";

import {DRAG_TIME,
        LEFT_MOUSE_BUTTON,
        SHIFT_KEY,
        CONTROL_KEY,
        COMMAND_KEY,
        D_KEY,
        S_KEY,
        OPTION_KEY,
        BACKSPACE_KEY,
        META_KEY} from "core/utils/Constants";

import {Vector,V} from "Vector";
import {CalculateMidpoint} from "math/MathUtils";

import {Event} from "./Events";


export type Listener = (event: Event) => void;

/**
 * Class to handle user input, and trigger appropriate event listeners
 */
export class Input {
    private canvas: HTMLCanvasElement;
    private prevMousePos: Vector;
    private mousePos: Vector;

    private mouseDown: boolean;
    private mouseDownPos: Vector;
    private mouseDownButton: number;

    private isDragging: boolean;
    private startTapTime: number;

    private touchCount: number;

    private listeners: Listener[];
    private keysDown: Map<number, boolean>;

    private dragTime: number;

    private blocked: boolean;

    /**
     * Initializes Input with given canvas and dragTime
     * @param canvas the canvas input is being applied to
     * @param dragTime the minimum length of time a mousedown must last to be considered a drag rather than a click
     */
    public constructor(canvas: HTMLCanvasElement, dragTime: number = DRAG_TIME) {
        this.canvas = canvas;
        this.dragTime = dragTime;
        this.blocked = false;

        this.reset();

        this.hookupKeyboardEvents();
        this.hookupMouseEvents();
        this.hookupTouchEvents();
        this.setupHammer();
    }

    /**
     * Checks if newKey is a prevented combination of keys
     * @param newKey represents the key combination being pressed
     * @returns true if newKey is a prevented combination, false otherwise
     */
    private isPreventedCombination(newKey: number): boolean {
        // Some browsers map shorcuts (for example - to CTRL+D but we use it to duplicate elements)
        //  So we need to disable some certain combinations of keys
        const PREVENTED_COMBINATIONS = [
            [[S_KEY], [CONTROL_KEY, COMMAND_KEY, META_KEY]],
            [[D_KEY], [CONTROL_KEY, COMMAND_KEY, META_KEY]],
            [[BACKSPACE_KEY]],
        ];

        // Check if some combination has every key pressed and newKey is one of them
        //  and return true if that's the case
        return PREVENTED_COMBINATIONS.some((combination) => {
            return combination.flat().includes(newKey) &&
                   combination.every(keys =>
                       keys.some(key => this.isKeyDown(key)));
        });
    }

    /**
     * Sets up Listeners for all keyboard Events
     */
    private hookupKeyboardEvents(): void {
        // Keyboard events
        window.addEventListener("keydown", (e: KeyboardEvent) => {
            if (!(document.activeElement instanceof HTMLInputElement)) {
                this.onKeyDown(e.keyCode);

                if (this.isPreventedCombination(e.keyCode))
                    e.preventDefault();
            }
        }, false);
        window.addEventListener("keyup",   (e: KeyboardEvent) => {
            if (!(document.activeElement instanceof HTMLInputElement))
                this.onKeyUp(e.keyCode)
        }, false);

        window.addEventListener("blur", (_: FocusEvent) => this.onBlur());

        window.addEventListener("paste", (ev: ClipboardEvent) => this.callListeners({ type: "paste", ev }));
        window.addEventListener("copy",  (ev: ClipboardEvent) => this.callListeners({ type: "copy",  ev }));
        window.addEventListener("cut",   (ev: ClipboardEvent) => this.callListeners({ type: "cut",   ev }));
    }

    /**
     * Sets up Listeners for mouse Events
     */
    private hookupMouseEvents(): void {
        // Mouse events
        this.canvas.addEventListener("click",      (e: MouseEvent) => this.onClick(V(e.clientX, e.clientY), e.button), false);
        this.canvas.addEventListener("dblclick",   (e: MouseEvent) => this.onDoubleClick(e.button), false);
        this.canvas.addEventListener("wheel",      (e: WheelEvent) => this.onScroll(e.deltaY), false);
        this.canvas.addEventListener("mousedown",  (e: MouseEvent) => this.onMouseDown(V(e.clientX, e.clientY), e.button), false);
        this.canvas.addEventListener("mouseup",    (e: MouseEvent) => this.onMouseUp(e.button), false);
        this.canvas.addEventListener("mousemove",  (e: MouseEvent) => this.onMouseMove(V(e.clientX, e.clientY)), false);
        this.canvas.addEventListener("mouseenter", (_: MouseEvent) => this.onMouseEnter(), false);
        this.canvas.addEventListener("mouseleave", (_: MouseEvent) => this.onMouseLeave(), false);

        this.canvas.addEventListener("contextmenu", (e: MouseEvent) => {
            e.preventDefault();
            this.callListeners({ type: "contextmenu" });
        });
    }

    /**
     * Sets up Listeners for touch events
     */
    private hookupTouchEvents(): void {
        const getTouchPositions = (touches: TouchList): Vector[] => {
            return Array.from(touches).map((t) => V(t.clientX, t.clientY));
        };

        // Touch screen events
        this.canvas.addEventListener("touchstart", (e: TouchEvent) => {
            this.onTouchStart(getTouchPositions(e.touches));
            e.preventDefault();
        }, false);

        this.canvas.addEventListener("touchmove", (e: TouchEvent) => {
            this.onTouchMove(getTouchPositions(e.touches));
            e.preventDefault();
        }, false);

        this.canvas.addEventListener("touchend", (e: TouchEvent) => {
            this.onTouchEnd();
            e.preventDefault();
        }, false);
    }

    /**
     * Sets up touchManagers for pinching and tapping
     */
    private setupHammer(): void {
        // Pinch to zoom
        const touchManager = new Hammer.Manager(this.canvas, {recognizers: []});
        let lastScale = 1;

        touchManager.add(new Hammer.Pinch());
        touchManager.on("pinch", (e) => {
            this.callListeners({
                type: "zoom",
                factor: lastScale/e.scale,
                pos: this.mousePos
            });
            lastScale = e.scale;
        });
        touchManager.on("pinchend", (_) => {
            lastScale = 1;
        });

        touchManager.add(new Hammer.Tap());
        touchManager.on("tap", (e) => {
            if (e.pointerType == "mouse")
                return;

            this.onClick(V(e.center.x, e.center.y));
        });
    }

    /**
     * Resets most variables to default values
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

        this.listeners = [];
        // this.listeners = new Map();
        this.keysDown  = new Map();
    }

    /**
     * Sets blocked to true
     */
    public block(): void {
        this.blocked = true;
    }
    /**
     * Sets blocked to false
     */
    public unblock(): void {
        this.blocked = false;
    }

    /**
     * Adds a Listener to the list of Listeners Events are checked against
     * @param listener is the Listener being added
     */
    public addListener(listener: Listener): void {
        this.listeners.push(listener);
    }

    /**
     * 
     * @returns true if the mouse is down, false otherwise
     */
    public isMouseDown(): boolean {
        return this.mouseDown;
    }
    /**
     * Checks if the given key is held down
     * @param key represents the key being checked
     * @returns true if key is down, false otherwise
     */
    public isKeyDown(key: number): boolean {
        return (this.keysDown.has(key) &&
                this.keysDown.get(key) == true);
    }

    /**
     * Checks if the shift key is held down
     * @returns true if the shift key is down, false otherwise
     */
    public isShiftKeyDown(): boolean {
        return this.isKeyDown(SHIFT_KEY);
    }
    /**
     * Checks if the modifier key is held down
     * @returns true if the modifier key (control, command, or meta) is down, false otherwise
     */
    public isModifierKeyDown(): boolean {
        return (this.isKeyDown(CONTROL_KEY) || this.isKeyDown(COMMAND_KEY) || this.isKeyDown(META_KEY));
    }
    /**
     * Checks if the option key is held down
     * @returns true if the option key is down, false otherwise
     */
    public isOptionKeyDown(): boolean {
        return this.isKeyDown(OPTION_KEY);
    }

    /**
     * 
     * @returns current position of the mouse
     */
    public getMousePos(): Vector {
        return V(this.mousePos);
    }
    /**
     * 
     * @returns current position of the mouse down
     */
    public getMouseDownPos(): Vector {
        return V(this.mouseDownPos);
    }
    /**
     * 
     * @returns difference between current and previous mouse position
     */
    public getDeltaMousePos(): Vector {
        return this.mousePos.sub(this.prevMousePos);
    }

    /**
     * 
     * @returns touchCount
     */
    public getTouchCount(): number {
        return this.touchCount;
    }

    /**
     * Sets the given key as down, and calls each Listener on Event "keydown", key
     * @param key represents the key being pressed
     */
    protected onKeyDown(key: number): void {
        this.keysDown.set(key, true);

        // call each listener
        this.callListeners({type: "keydown", key});
    }
    /**
     * Sets the given key as up, and calls each Listener on Event "keyup", key
     * @param key represents the key being released
     */
    protected onKeyUp(key: number): void {
        this.keysDown.set(key, false);

        // call each listener
        this.callListeners({type: "keyup", key});
    }

    /**
     * Calls each Listener on Event "click", button
     * @param _ unused position vector
     * @param button represents the mouse button being clicked (left mouse button by default)
     */
    protected onClick(_: Vector, button: number = LEFT_MOUSE_BUTTON): void {
        // Don't call onclick if was dragging
        if (this.isDragging) {
            this.isDragging = false;
            return;
        }

        // call each listener
        this.callListeners({type: "click", button});
    }
    /**
     * Calls each Listener on Event "dbclick", button
     * @param button represents the mouse button being double clicked
     */
    protected onDoubleClick(button: number): void {

        // call each listener
        this.callListeners({type: "dblclick", button});
    }

    /**
     * Calls each Listener on Event "zoom", zoomFactor, mousePos
     * where zoomFactor is calculated from delta
     * @param delta represents whether the user is zooming in or out (negative and positive, respectively)
     */
    protected onScroll(delta: number): void {
        // calculate zoom factor
        let zoomFactor = 0.95;
        if (delta >= 0)
            zoomFactor = 1.0 / zoomFactor;

        this.callListeners({
            type: "zoom",
            factor: zoomFactor,
            pos: this.mousePos
        });
    }

    /**
     * Adjusts mouse variables (dragging, position, etc.),
     * and triggers Listeners on Event "mousedown", button
     * @param pos represents the position of the mouse being pressed
     * @param button represents the mouse button being pressed (0 by default)
     */
    protected onMouseDown(pos: Vector, button: number = 0): void {
        const rect = this.canvas.getBoundingClientRect();

        this.touchCount++;

        // reset dragging and set mouse stuff
        this.isDragging = false;
        this.startTapTime = Date.now();
        this.mouseDown = true;
        this.mouseDownPos = pos.sub(V(rect.left, rect.top));
        this.mousePos = V(this.mouseDownPos);
        this.mouseDownButton = button;

        this.callListeners({type: "mousedown", button});
    }
    /**
     * Triggered on mouse movement, calculates new mouse position,
     * and triggers Listeners on Event "mousemove", as well as Listeners
     * on Event "mousedrag", [current mouse button down] if the user is clicking
     * @param pos represents the new absolute position of the mouse
     */
    protected onMouseMove(pos: Vector): void {
        const rect = this.canvas.getBoundingClientRect();

        // get raw and relative mouse positions
        this.prevMousePos = V(this.mousePos);
        this.mousePos = pos.sub(V(rect.left, rect.top));

        // determine if mouse is dragging
        this.isDragging = (this.mouseDown &&
                           Date.now() - this.startTapTime > this.dragTime);

        if (this.isDragging) {
            this.callListeners({
                type:"mousedrag",
                button: this.mouseDownButton
            });
        }
        this.callListeners({type: "mousemove"});
    }
    /**
     * Calls each Listener on Event "mouseup", button
     * and adjusts variables tracking mouse buttons
     * @param button represents the mouse button being released (0 by default)
     */
    protected onMouseUp(button: number = 0): void {
        this.touchCount = Math.max(0, this.touchCount - 1); // Should never have -1 touches
        this.mouseDown = false;
        this.mouseDownButton = -1;

        this.callListeners({type: "mouseup", button});
    }

    /**
     * Calls each Listener on Event "mouseenter"
     */
    protected onMouseEnter(): void {
        this.callListeners({type: "mouseenter"});
    }
    /**
     * Calls each Listener on Event "mouseleave".
     * Also calls on Event "mouseup", [current mouse button down]
     */
    protected onMouseLeave(): void {
        this.touchCount = 0;
        this.mouseDown = false;

        this.callListeners({type: "mouseleave"});

        // call mouse up as well so that
        //  up events get called when the
        //  mouse leaves
        this.callListeners({
            type: "mouseup",
            button: this.mouseDownButton
        });
    }

    /**
     * Calls onMouseDown for the midpoint of multiple touches
     * @param touches represents the positions of the touches
     */
    protected onTouchStart(touches: Vector[]): void {
        this.onMouseDown(CalculateMidpoint(touches));
    }
    /**
     * Called when a user moves a touch point (as when using a touchpad or mobile device)
     * Calls onMouseMove for the midpoint of multiple movements
     * @param touches represents the positions of the touches
     */
    protected onTouchMove(touches: Vector[]): void {
        this.onMouseMove(CalculateMidpoint(touches));
    }
    /**
     * Calls onMouseUp
     */
    protected onTouchEnd(): void {
        this.onMouseUp();
    }

    /**
     * Releases each key that is down
     */
    protected onBlur(): void {
        this.keysDown.forEach((down, key) => {
            if (down)
                this.onKeyUp(key);
        });
    }

    /**
     * Calls the Listeners in 'listeners' for Event 'event'
     * @param event Event being given to the Listeners
     */
    private callListeners(event: Event): void {
        if (this.blocked)
            return;

        for (const listener of this.listeners)
            listener(event);
    }
}
