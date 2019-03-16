import {DRAG_TIME,
        LEFT_MOUSE_BUTTON,
        SHIFT_KEY,
        CONTROL_KEY,
        COMMAND_KEY,
        OPTION_KEY} from "./Constants";

import {Vector,V} from "../utils/math/Vector";

export class Input {
    private canvas: HTMLCanvasElement;
    private prevMousePos: Vector;
    private rawMousePos: Vector;
    private mousePos: Vector;

    private mouseDown: boolean;
    private mouseDownPos: Vector;

    private isDragging: boolean;
    private startTapTime: number;

    private zoomFactor: number;

    private listeners: Map<string, Array<(b?: number) => void> >;

    private keysDown: Map<number, boolean>;

    private dragTime: number;

    public constructor(canvas: HTMLCanvasElement, dragTime: number = DRAG_TIME) {
        this.canvas = canvas;
        this.listeners = new Map();
        this.keysDown  = new Map();
        this.dragTime = dragTime;

        window.addEventListener('keydown',  (e: KeyboardEvent) => this.onKeyDown(e), false);
        window.addEventListener('keyup',    (e: KeyboardEvent) => this.onKeyUp(e), false);

        canvas.addEventListener('click',        (e: MouseEvent) => this.onClick(e),         false);
        canvas.addEventListener('dblclick',     (e: MouseEvent) => this.onDoubleClick(e),   false);
        canvas.addEventListener('wheel',        (e: WheelEvent) => this.onScroll(e),        false);
        canvas.addEventListener('mousedown',    (e: MouseEvent) => this.onMouseDown(e),     false);
        canvas.addEventListener('mouseup',      (e: MouseEvent) => this.onMouseUp(e),       false);
        canvas.addEventListener('mousemove',    (e: MouseEvent) => this.onMouseMove(e),     false);
        canvas.addEventListener('mouseenter',   (e: MouseEvent) => this.onMouseEnter(e),    false);
        canvas.addEventListener('mouseleave',   (e: MouseEvent) => this.onMouseLeave(e),    false);
    }

    public addListener(type: string, listener: (b?: number) => void): void {
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

    public isShiftKeyDown() {
        return this.isKeyDown(SHIFT_KEY);
    }
    public isModifierKeyDown() {
        return (this.isKeyDown(CONTROL_KEY) || this.isKeyDown(COMMAND_KEY));
    }
    public isOptionKeyDown() {
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
    public getZoomFactor(): number {
        return this.zoomFactor;
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
    private onClick(event: MouseEvent): void {
        // Don't call onclick if was dragging
        if (this.isDragging) {
            this.isDragging = false;
            return;
        }

        // call each listener
        this.callListeners("click", event.button);
    }
    private onDoubleClick(event: MouseEvent): void {

        // call each listener
        this.callListeners("dblclick", 0);
    }
    private onScroll(event: WheelEvent): void {
        const delta = -event.deltaY / 120.0;

        // calculate zoom factor
        this.zoomFactor = 0.95;
        if (delta < 0)
            this.zoomFactor = 1.0 / this.zoomFactor;

        // call each listener
        this.callListeners("scroll", 0);
    }
    private onMouseDown(event: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();

        // reset dragging and set mouse stuff
        this.isDragging = false;
        this.startTapTime = Date.now();
        this.mouseDown = true;
        this.mouseDownPos = V(event.clientX - rect.left,
                              event.clientY - rect.top);
        this.mousePos = V(this.mouseDownPos);

        // call each listener
        this.callListeners("mousedown", 0);
    }
    private onMouseUp(event: MouseEvent): void {
        this.mouseDown = false;

        // call each listener
        this.callListeners("mouseup", 0);
    }
    private onMouseMove(event: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();

        // get raw and relative mouse positions
        this.prevMousePos = V(this.mousePos);
        this.rawMousePos  = V(event.clientX, event.clientY);
        this.mousePos = this.rawMousePos.sub(V(rect.left, rect.top));

        // determine if mouse is dragging
        this.isDragging = (this.mouseDown &&
                           Date.now() - this.startTapTime > this.dragTime);

        // call listeners
        if (this.isDragging)
            this.callListeners("mousedrag", LEFT_MOUSE_BUTTON);
        this.callListeners("mousemove", 0);
    }
    private onMouseEnter(event: MouseEvent): void {
        // call each listener
        this.callListeners("mouseenter", 0);
    }
    private onMouseLeave(event: MouseEvent): void {
        this.mouseDown = false;

        // call each listener
        this.callListeners("mouseleave", 0);

        // call mouse up as well so that
        //  up events get called when the
        //  mouse leaves
        this.callListeners("mouseup", 0);
    }
    private callListeners(type: string, b?: number) {
        // call all listeners of type
        const listeners = this.listeners.get(type);
        if (listeners != undefined) {
            for (let listener of listeners)
                listener(b);
        }
    }
}
