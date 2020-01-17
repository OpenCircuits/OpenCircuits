import {DRAG_TIME,
        LEFT_MOUSE_BUTTON,
        SHIFT_KEY,
        CONTROL_KEY,
        COMMAND_KEY,
        D_KEY,
        OPTION_KEY,
        BACKSPACE_KEY,
        META_KEY} from "core/utils/Constants";

import {Vector,V} from "Vector";
import {CalculateMidpoint} from "math/MathUtils";

import * as Hammer from "hammerjs";

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

    private listeners: Map<string, Array<(a?: number, b?: Vector) => void> >;
    private keysDown: Map<number, boolean>;

    private dragTime: number;

    public constructor(canvas: HTMLCanvasElement, dragTime: number = DRAG_TIME) {
        this.canvas = canvas;
        this.dragTime = dragTime;

        this.reset();

        this.hookupKeyboardEvents();
        this.hookupMouseEvents();
        this.hookupTouchEvents();
        this.setupHammer();
    }

    private isPreventedCombination(newKey: number): boolean {
        // Some browsers map shorcuts (for example - to CTRL+D but we use it to duplicate elements)
        //  So we need to disable some certain combinations of keys
        const PREVENTED_COMBINATIONS = [
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
    }

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
    }

    private hookupTouchEvents(): void {
        const getTouchPositions = (touches: TouchList): Array<Vector> => {
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

    private setupHammer(): void {
        // Pinch to zoom
        const touchManager = new Hammer.Manager(this.canvas, {recognizers: []});
        let lastScale = 1;

        touchManager.add(new Hammer.Pinch());
        touchManager.on("pinch", (e) => {
            this.callListeners("zoom", lastScale/e.scale, this.mousePos);
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

    public reset(): void {
        this.prevMousePos = V();
        this.mousePos = V();

        this.mouseDown = false;
        this.mouseDownPos = V();
        this.mouseDownButton = 0;

        this.isDragging = false;
        this.startTapTime = 0;

        this.touchCount = 0;

        this.listeners = new Map();
        this.keysDown  = new Map();
    }

    public addListener(type: string, listener: (a?: number, b?: Vector) => void): void {
        let arr = this.listeners.get(type);
        if (arr == undefined)
            this.listeners.set(type, arr = []);
        arr.push(listener);
    }

    public isMouseDown(): boolean {
        return this.mouseDown;
    }
    public isKeyDown(key: number): boolean {
        return (this.keysDown.has(key) &&
                this.keysDown.get(key) == true);
    }

    public isShiftKeyDown(): boolean {
        return this.isKeyDown(SHIFT_KEY);
    }
    public isModifierKeyDown(): boolean {
        return (this.isKeyDown(CONTROL_KEY) || this.isKeyDown(COMMAND_KEY) || this.isKeyDown(META_KEY));
    }
    public isOptionKeyDown(): boolean {
        return this.isKeyDown(OPTION_KEY);
    }

    public getMousePos(): Vector {
        return V(this.mousePos);
    }
    public getMouseDownPos(): Vector {
        return V(this.mouseDownPos);
    }
    public getDeltaMousePos(): Vector {
        return this.mousePos.sub(this.prevMousePos);
    }

    public getTouchCount(): number {
        return this.touchCount;
    }

    protected onKeyDown(code: number): void {
        this.keysDown.set(code, true);

        // call each listener
        this.callListeners("keydown", code);
    }
    protected onKeyUp(code: number): void {
        this.keysDown.set(code, false);

        // call each listener
        this.callListeners("keyup", code);
    }

    protected onClick(_: Vector, button: number = LEFT_MOUSE_BUTTON): void {
        // Don't call onclick if was dragging
        if (this.isDragging) {
            this.isDragging = false;
            return;
        }

        // call each listener
        this.callListeners("click", button);
    }
    protected onDoubleClick(button: number): void {

        // call each listener
        this.callListeners("dblclick", button);
    }

    protected onScroll(delta: number): void {
        // calculate zoom factor
        let zoomFactor = 0.95;
        if (delta >= 0)
            zoomFactor = 1.0 / zoomFactor;

        // call each listener
        this.callListeners("zoom", zoomFactor, this.mousePos);
    }

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

        // call each listener
        this.callListeners("mousedown", button);
    }
    protected onMouseMove(pos: Vector): void {
        const rect = this.canvas.getBoundingClientRect();

        // get raw and relative mouse positions
        this.prevMousePos = V(this.mousePos);
        this.mousePos = pos.sub(V(rect.left, rect.top));

        // determine if mouse is dragging
        this.isDragging = (this.mouseDown &&
                           Date.now() - this.startTapTime > this.dragTime);

        // call listeners
        if (this.isDragging)
            this.callListeners("mousedrag", this.mouseDownButton);
        this.callListeners("mousemove");
    }
    protected onMouseUp(button: number = 0): void {
        this.touchCount = Math.max(0, this.touchCount - 1); // Should never have -1 touches
        this.mouseDown = false;
        this.mouseDownButton = -1;

        // call each listener
        this.callListeners("mouseup", button);
    }

    protected onMouseEnter(): void {
        // call each listener
        this.callListeners("mouseenter");
    }
    protected onMouseLeave(): void {
        this.touchCount = 0;
        this.mouseDown = false;

        // call each listener
        this.callListeners("mouseleave");

        // call mouse up as well so that
        //  up events get called when the
        //  mouse leaves
        this.callListeners("mouseup", this.mouseDownButton);
    }

    protected onTouchStart(touches: Array<Vector>): void {
        this.onMouseDown(CalculateMidpoint(touches));
    }
    protected onTouchMove(touches: Array<Vector>): void {
        this.onMouseMove(CalculateMidpoint(touches));
    }
    protected onTouchEnd(): void {
        this.onMouseUp();
    }

    protected onBlur(): void {
        // Release each key that is down
        this.keysDown.forEach((down, key) => {
            if (down)
                this.onKeyUp(key);
        });
    }

    private callListeners(type: string, a?: number, b?: Vector): void {
        // call all listeners of type
        const listeners = this.listeners.get(type);
        if (listeners != undefined) {
            for (const listener of listeners)
                listener(a, b);
        }
    }
}
