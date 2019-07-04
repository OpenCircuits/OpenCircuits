import {DRAG_TIME,
        LEFT_MOUSE_BUTTON,
        SHIFT_KEY,
        CONTROL_KEY,
        COMMAND_KEY,
        OPTION_KEY} from "./Constants";

import {Vector,V} from "../utils/math/Vector";

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
        this.listeners = new Map();
        this.keysDown  = new Map();
        this.dragTime = dragTime;
        this.touchCount = 0;

        // Keyboard events
        window.addEventListener('keydown', (e: KeyboardEvent) => {
            if (!(document.activeElement instanceof HTMLInputElement))
                this.onKeyDown(e)
        }, false);
        window.addEventListener('keyup',   (e: KeyboardEvent) => {
            if (!(document.activeElement instanceof HTMLInputElement))
                this.onKeyUp(e)
        }, false);


        // Mouse events
        canvas.addEventListener('click',      (e: MouseEvent) => this.onClick(V(e.clientX, e.clientY), e.button), false);
        canvas.addEventListener('dblclick',   (e: MouseEvent) => this.onDoubleClick(e),   false);
        canvas.addEventListener('wheel',      (e: WheelEvent) => this.onScroll(e.deltaY), false);
        canvas.addEventListener('mousedown',  (e: MouseEvent) => this.onMouseDown(V(e.clientX, e.clientY), e.button), false);
        canvas.addEventListener('mouseup',    (e: MouseEvent) => this.onMouseUp(  V(e.clientX, e.clientY), e.button), false);
        canvas.addEventListener('mousemove',  (e: MouseEvent) => this.onMouseMove(V(e.clientX, e.clientY)), false);
        canvas.addEventListener('mouseenter', (e: MouseEvent) => this.onMouseEnter(e),    false);
        canvas.addEventListener('mouseleave', (e: MouseEvent) => this.onMouseLeave(e),    false);


        // Touch screen events
        canvas.addEventListener('touchstart', (e: TouchEvent) => {
            this.onMouseDown(this.calculateCenter(e.touches));
            e.preventDefault();
        }, false);

        canvas.addEventListener('touchmove', (e: TouchEvent) => {
            this.onMouseMove(this.calculateCenter(e.touches));
            e.preventDefault();
        }, false);

        canvas.addEventListener('touchend', (e: TouchEvent) => {
            this.onMouseUp(V());
            e.preventDefault();
        }, false);


        // Pinch to zoom
        const touchManager = new Hammer.Manager(canvas, {recognizers: []});
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

    private calculateCenter(touchList: TouchList): Vector {
        // Calculate midpoint of all touches
        const touches = Array.from(touchList);
        return touches.reduce((sum, touch) =>
                    sum.add(V(touch.clientX, touch.clientY)), V(0,0))
                    .scale(1.0 / touches.length);
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
        return (this.isKeyDown(CONTROL_KEY) || this.isKeyDown(COMMAND_KEY));
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

    private onKeyDown(event: KeyboardEvent): void {
        const code = event.keyCode;
        this.keysDown.set(code, true);

        // call each listener
        this.callListeners("keydown", code);
    }
    private onKeyUp(event: KeyboardEvent): void {
        const code = event.keyCode;
        this.keysDown.set(code, false);

        // call each listener
        this.callListeners("keyup", code);
    }

    private onClick(_: Vector, button: number = LEFT_MOUSE_BUTTON): void {
        // Don't call onclick if was dragging
        if (this.isDragging) {
            this.isDragging = false;
            return;
        }

        // call each listener
        this.callListeners("click", button);
    }
    private onDoubleClick(_: MouseEvent): void {

        // call each listener
        this.callListeners("dblclick", 0);
    }

    private onScroll(delta: number): void {
        // calculate zoom factor
        let zoomFactor = 0.95;
        if (delta >= 0)
            zoomFactor = 1.0 / zoomFactor;

        // call each listener
        this.callListeners("zoom", zoomFactor, this.mousePos);
    }

    private onMouseDown(pos: Vector, button: number = 0): void {
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
    private onMouseMove(pos: Vector): void {
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
    private onMouseUp(_: Vector, button: number = 0): void {
        this.touchCount--;
        this.mouseDown = false;
        this.mouseDownButton = -1;

        // call each listener
        this.callListeners("mouseup", button);
    }

    private onMouseEnter(_: MouseEvent): void {
        // call each listener
        this.callListeners("mouseenter");
    }
    private onMouseLeave(_: MouseEvent): void {
        this.mouseDown = false;

        // call each listener
        this.callListeners("mouseleave");

        // call mouse up as well so that
        //  up events get called when the
        //  mouse leaves
        this.callListeners("mouseup", this.mouseDownButton);
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
