import Hammer from "hammerjs";

import {DRAG_TIME,
        LEFT_MOUSE_BUTTON,
        MIDDLE_MOUSE_BUTTON} from "./Constants";

import {V, Vector} from "Vector";

import {CalculateMidpoint} from "math/MathUtils";

import {ObservableImpl} from "shared/api/circuit/utils/Observable";

import {Key}               from "./Key";
import {InputAdapterEvent} from "./InputAdapterEvent";
import {UserInputState}    from "./UserInputState";


export class UserInputStateImpl implements UserInputState {
    public mouseDownPos: Vector;
    public prevMousePos: Vector;
    public mousePos: Vector;

    public isMouseDown: boolean;
    public mouseDownButton: number;

    public isDragging: boolean;
    public startTapTime: number;

    public touchCount: number;

    public keysDown: Set<Key>;

    public constructor() {
        this.mouseDownPos = V();
        this.prevMousePos = V();
        this.mousePos = V();

        this.isMouseDown = false;
        this.mouseDownButton = 0;

        this.isDragging = false;
        this.startTapTime = 0;

        this.touchCount = 0;

        this.keysDown = new Set();
    }

    public get deltaMousePos() {
        return this.mousePos.sub(this.prevMousePos);
    }

    public get isShiftKeyDown() {
        return this.keysDown.has("Shift")
    }
    public get isEscKeyDown() {
        return this.keysDown.has("Escape")
    }
    public get isModifierKeyDown() {
        return (this.keysDown.has("Control") || this.keysDown.has("Meta"));
    }
    public get isAltKeyDown() {
        return this.keysDown.has("Alt")
    }
}

/**
 * Class to handle user input, and trigger appropriate event listeners.
 */
export class InputAdapter extends ObservableImpl<InputAdapterEvent> {
    /** Amount of time a mousebutton needs to be held down to be considered a "drag" (rather than a "click"). */
    private readonly dragTime: number;

    /** The canvas the user is performing inputs on. */
    private readonly canvas: HTMLCanvasElement;

    public state: UserInputStateImpl;

    public readonly cleanup: () => void;

    /**
     * Initializes Input with given canvas and dragTime.
     *
     * @param canvas   The canvas to adapt the inputs of.
     * @param dragTime The minimum length of time a mousedown must last to be considered a drag rather than a click.
     */
    public constructor(canvas: HTMLCanvasElement, dragTime: number = DRAG_TIME) {
        super();
        this.dragTime = dragTime;
        this.canvas = canvas;
        this.state = new UserInputStateImpl();

        // Setup adapters
        const tearDownKeyboardEvents = this.hookupKeyboardEvents();
        const tearDownMouseEvents    = this.hookupMouseEvents(canvas);
        const tearDownTouchEvents    = this.hookupTouchEvents(canvas);
        const tearDownHammer         = this.setupHammer(canvas);

        this.cleanup = () => {
            tearDownHammer();
            tearDownTouchEvents();
            tearDownMouseEvents();
            tearDownKeyboardEvents();

            this.unsubscribeAll();
        };
    }

    /**
     * Checks if newKey is a prevented combination of keys.
     *
     * @param newKey Represents the key combination being pressed.
     * @returns      True if newKey is a prevented combination, false otherwise.
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
                keys.some((key) => this.state.keysDown.has(key))
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

        const parseKey = (key: string): Key => {
            // Assume it's alphanumeric if it's a single-character keycode
            //  and make it lowercase for consistency
            if (key.length === 1)
                return key.toLowerCase() as Key;
            return key as Key; // Otherwise just leave it alone and explicitly cast
        }

        const onKeyDown = (e: KeyboardEvent) => {
            const key = parseKey(e.key);
            // Check for "Alt" to fix issue #943
            if (key === "Alt" || !(document.activeElement instanceof HTMLInputElement)) {
                // Only lowercase version since that's the only type allowed as defined
                //  in Key.ts and pressing Shift will make it uppercase.
                this.onKeyDown(key);

                if (this.isPreventedCombination(key))
                    e.preventDefault();
            }
        }
        const onKeyUp = (e: KeyboardEvent) => {
            const key = parseKey(e.key);

            // Check for "Alt" to fix issue #943
            if (key === "Alt" || !(document.activeElement instanceof HTMLInputElement))
                this.onKeyUp(key);

            // Check for Meta key and release all other keys on up
            //  See https://stackoverflow.com/q/27380018/5911675
            if (key === "Meta")
                this.state.keysDown.forEach((key) => this.onKeyUp(key));

        }
        const onBlur = () => this.onBlur();

        const hasFocus = () => {
            // If a label element is not selected,
            // or if an editable component is selected but it is a "Caret" (cursor) instead of highlighted text,
            // then copy the component
            // Otherwise there is text selected, so do default copying
            // Necessary to fix #874
            // TODO[master](leon) - Find a better way to do this (See if canvas is focused somehow?)
            const sel = document.getSelection();
            return !(sel?.anchorNode?.nodeName === "LABEL" && sel?.type !== "Caret");
        }

        const onPaste = (ev: ClipboardEvent) => {
            if (hasFocus())
                this.publish({ input: this.state, type: "paste", ev });
        }
        const onCopy  = (ev: ClipboardEvent) => {
            if (hasFocus())
                this.publish({ input: this.state, type: "copy",  ev });
        }
        const onCut   = (ev: ClipboardEvent) => {
            if (hasFocus())
                this.publish({ input: this.state, type: "cut",   ev });
        }


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
     * @returns      A callback to tear down these event listeners.
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
            this.publish({ input: this.state, type: "contextmenu" });
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
     * @returns      A callback to tear down these event listeners.
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
     * @returns      A callback to tear down these event listeners.
     */
    private setupHammer(canvas: HTMLCanvasElement): () => void {
        let lastScale = 1;

        // Used for pinch to zoom
        const pinch = new Hammer.Pinch();
        const onPinch = (e: HammerInput) => {
            this.publish({
                input:  this.state,
                type:   "zoom",
                factor: lastScale/e.scale,
                pos:    this.state.mousePos,
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
     * Sets the given key as down, and calls each Listener on Event "keydown", key.
     *
     * @param key Represents the key being pressed.
     */
    protected onKeyDown(key: Key): void {
        this.state.keysDown.add(key);

        this.publish({ input: this.state, type: "keydown", key });
    }
    /**
     * Sets the given key as up, and calls each Listener on Event "keyup", key.
     *
     * @param key Represents the key being released.
     */
    protected onKeyUp(key: Key): void {
        this.state.keysDown.delete(key);

        // call each listener
        this.publish({ input: this.state, type: "keyup", key });
    }

    /**
     * Calls each Listener on Event "click", button.
     *
     * @param _      Unused position vector.
     * @param button Represents the mouse button being clicked (left mouse button by default).
     */
    protected onClick(_: Vector, button: number = LEFT_MOUSE_BUTTON): void {
        // Don't call onclick if was dragging
        if (this.state.isDragging) {
            this.state.isDragging = false;
            return;
        }

        // call each listener
        this.publish({ input: this.state, type: "click", button });
    }
    /**
     * Calls each Listener on Event "dbclick", button.
     *
     * @param button Represents the mouse button being double clicked.
     */
    protected onDoubleClick(button: number): void {

        // call each listener
        this.publish({ input: this.state, type: "dblclick", button });
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
            input:  this.state,
            type:   "zoom",
            factor: zoomFactor,
            pos:    this.state.mousePos,
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

        this.state.touchCount++;

        // reset dragging and set mouse stuff
        this.state.isDragging = false;
        this.state.startTapTime = Date.now();
        this.state.isMouseDown = true;
        this.state.mouseDownPos = pos.sub(rect.left, rect.top)
                               // Scale in case the real canvas size is different then the pixel size
                               // (i.e. image exporter)
                               .scale(V(this.canvas.width / rect.width, this.canvas.height / rect.height));

        this.state.mousePos = V(this.state.mouseDownPos);
        this.state.mouseDownButton = button;

        this.publish({ input: this.state, type: "mousedown", button });
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
        this.state.prevMousePos = V(this.state.mousePos);
        this.state.mousePos = pos.sub(rect.left, rect.top)
                           // Scale in case the real canvas size is different then the pixel size (i.e. image exporter)
                           .scale(V(this.canvas.width / rect.width, this.canvas.height / rect.height));

        // determine if mouse is dragging
        this.state.isDragging = (this.state.isMouseDown &&
                           Date.now() - this.state.startTapTime > this.dragTime);

        if (this.state.isDragging) {
            this.publish({
                input:  this.state,
                type:   "mousedrag",
                button: this.state.mouseDownButton,
            });
        }
        this.publish({ input: this.state, type: "mousemove" });
    }
    /**
     * Calls each Listener on Event "mouseup", button
     * and adjusts variables tracking mouse buttons.
     *
     * @param button Represents the mouse button being released (0 by default).
     */
    protected onMouseUp(button = 0): void {
        this.state.touchCount = Math.max(0, this.state.touchCount - 1); // Should never have -1 touches
        this.state.isMouseDown = false;
        this.state.mouseDownButton = -1;

        this.publish({ input: this.state, type: "mouseup", button });
    }

    /**
     * Calls each Listener on Event "mouseenter".
     */
    protected onMouseEnter(): void {
        this.publish({ input: this.state, type: "mouseenter" });
    }
    /**
     * Calls each Listener on Event "mouseleave".
     * Also calls on Event "mouseup", [current mouse button down].
     */
    protected onMouseLeave(): void {
        this.state.touchCount = 0;
        this.state.isMouseDown = false;

        this.publish({ input: this.state, type: "mouseleave" });

        // call mouse up as well so that
        //  up events get called when the
        //  mouse leaves
        this.publish({
            input:  this.state,
            type:   "mouseup",
            button: this.state.mouseDownButton,
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
        this.state.keysDown.forEach((down, key) => {
            if (down)
                this.onKeyUp(key);
        });
    }
}
