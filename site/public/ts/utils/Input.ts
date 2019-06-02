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
    private rawMousePos: Vector;
    private mousePos: Vector;

    private mouseDown: boolean;
    private mouseDownPos: Vector;

    private isDragging: boolean;
    private startTapTime: number;

    private touchCount: number;

    private listeners: Map<string, Array<(a?: number, b?: number) => void> >;

    private keysDown: Map<number, boolean>;

    private dragTime: number;

    public constructor(canvas: HTMLCanvasElement, dragTime: number = DRAG_TIME) {
        this.canvas = canvas;
        this.listeners = new Map();
        this.keysDown  = new Map();
        this.dragTime = dragTime;
        this.touchCount = 0;

        // Keyboard events
        window.addEventListener('keydown',  (e: KeyboardEvent) => {
            if (!(document.activeElement instanceof HTMLInputElement))
                this.onKeyDown(e)
        }, false);
        window.addEventListener('keyup',    (e: KeyboardEvent) => {
            if (!(document.activeElement instanceof HTMLInputElement))
                this.onKeyUp(e)
        }, false);


        // Mouse events
        canvas.addEventListener('click',      (e: MouseEvent) => this.onClick(e),         false);
        canvas.addEventListener('dblclick',   (e: MouseEvent) => this.onDoubleClick(e),   false);
        canvas.addEventListener('wheel',      (e: WheelEvent) => this.onScroll(e.deltaY), false);
        canvas.addEventListener('mousedown',  (e: MouseEvent) => this.onMouseDown(V(e.clientX, e.clientY)), false);
        canvas.addEventListener('mouseup',    (e: MouseEvent) => this.onMouseUp(  V(e.clientX, e.clientY)), false);
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
            this.callListeners("zoom", this.mousePos, lastScale/e.scale);
            lastScale = e.scale;
        });
        touchManager.on("pinchend", (e) => {
            lastScale = 1;
        });
    }

    private calculateCenter(touches: TouchList): Vector {
        // Calculate midpoint of all touches
        let center = V(0,0);
        for (let i = 0; i < touches.length; i++)
            center = center.add(V(touches[i].clientX, touches[i].clientY));
        return center.scale(1.0 / touches.length);
    }

    public addListener(type: string, listener: (a?: any, b?: any) => void): void {
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

    private onScroll(delta: number): void {
        // calculate zoom factor
        let zoomFactor = 0.95;
        if (delta >= 0)
            zoomFactor = 1.0 / zoomFactor;

        // call each listener
        this.callListeners("zoom", this.mousePos, zoomFactor);
    }

    private onMouseDown(pos: Vector): void {
        const rect = this.canvas.getBoundingClientRect();

        this.touchCount++;

        // reset dragging and set mouse stuff
        this.isDragging = false;
        this.startTapTime = Date.now();
        this.mouseDown = true;
        this.mouseDownPos = pos.sub(V(rect.left, rect.top));
        this.mousePos = V(this.mouseDownPos);

        // call each listener
        this.callListeners("mousedown", 0);
    }
    private onMouseMove(pos: Vector): void {
        const rect = this.canvas.getBoundingClientRect();

        // get raw and relative mouse positions
        this.rawMousePos  = pos;
        this.prevMousePos = V(this.mousePos);
        this.mousePos = pos.sub(V(rect.left, rect.top));

        // determine if mouse is dragging
        this.isDragging = (this.mouseDown &&
                           Date.now() - this.startTapTime > this.dragTime);

        // call listeners
        if (this.isDragging)
            this.callListeners("mousedrag", LEFT_MOUSE_BUTTON);
        this.callListeners("mousemove", 0);
    }
    private onMouseUp(pos: Vector): void {
        this.touchCount--;
        this.mouseDown = false;

        // call each listener
        this.callListeners("mouseup", 0);
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

    private callListeners(type: string, a?: any, b?: any) {
        // call all listeners of type
        const listeners = this.listeners.get(type);
        if (listeners != undefined) {
            for (let listener of listeners)
                listener(a, b);
        }
    }
}
