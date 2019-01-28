import {DRAG_TIME,
        LEFT_MOUSE_BUTTON} from "./Constants";

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

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.listeners = new Map();
        this.keysDown = new Map();

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

        // // if (browser.name !== "Firefox")
        //     canvas.addEventListener('wheel', e => onWheel(e), false);
        // // else
        // //     canvas.addEventListener('DOMMouseScroll', e => onWheel(e), false);

        // canvas.addEventListener('mouseenter', e => { if (PlaceItemController.drag) { onMouseMove(e); onClick(e); PlaceItemController.drag = false; }}, false);
        // canvas.addEventListener("mouseleave", e => { allKeysUp(canvas); if (mouseDown) { onMouseUp(e); onClick(e); } });

        // canvas.addEventListener("contextmenu", function(e) {
        //     contextmenu.show(e);
        //     e.preventDefault();
        // });
    }
    public addListener(type: string, listener: (b: number) => void): void {
        var arr = this.listeners.get(type);
        if (arr == undefined)
            this.listeners.set(type, arr = []);
        arr.push(listener);
    }
    public isMouseDown(): boolean {
        return this.mouseDown;
    }
    public isKeyDown(key: number): boolean {
        return (this.keysDown.get(key) != null &&
                this.keysDown.get(key) == true);
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
        var code = event.keyCode;
        this.keysDown.set(code, true);

        // call each listener
        this.callListeners("keydown", code);
    }
    private onKeyUp(event: KeyboardEvent): void {
        var code = event.keyCode;
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
        var delta = -event.deltaY / 120.0;

        // calculate zoom factor
        this.zoomFactor = 0.95;
        if (delta < 0)
            this.zoomFactor = 1.0 / this.zoomFactor;

        // call each listener
        this.callListeners("scroll", 0);
    }
    private onMouseDown(event: MouseEvent): void {
        var rect = this.canvas.getBoundingClientRect();

        // reset dragging and set mouse stuff
        this.isDragging = false;
        this.startTapTime = Date.now();
        this.mouseDown = true;
        this.mouseDownPos = V(event.clientX - rect.left,
                              event.clientY - rect.top);

        // call each listener
        this.callListeners("mousedown", 0);
    }
    private onMouseUp(event: MouseEvent): void {
        this.mouseDown = false;

        // call each listener
        this.callListeners("mouseup", 0);
    }
    private onMouseMove(event: MouseEvent): void {
        var rect = this.canvas.getBoundingClientRect();

        // get raw and relative mouse positions
        this.prevMousePos = V(this.mousePos);
        this.rawMousePos  = V(event.clientX, event.clientY);
        this.mousePos = this.rawMousePos.sub(V(rect.left, rect.top));

        // determine if mouse is dragging
        this.isDragging = (this.mouseDown) &&
                          (Date.now() - this.startTapTime > DRAG_TIME);

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
        var listeners = this.listeners.get(type);
        if (listeners != undefined) {
            for (let listener of listeners)
                listener(b);
        }
    }
}

//
// var InputController = (function () {
//     var rawMousePos = new Vector(0, 0);
//     var mousePos = new Vector(0,0);
//     var prevMousePos = new Vector(0,0);
//     var worldMousePos = new Vector(0,0);
//
//     var mouseDown = false;
//     var mouseDownPos = undefined;
//
//     var mouseListeners = [];
//
//     var z = 0;
//
//     var shiftKeyDown = false;
//     var modifierKeyDown = false;
//     var optionKeyDown = false;
//
//     var isDragging = false;
//     var startTapTime = undefined;
//
//     var allKeysUp = function(canvas) {
//         shiftKeyDown = false;
//         modifierKeyDown = false;
//         optionKeyDown = false;
//         canvas.style.cursor = "default";
//     }
//     var onKeyDown = function(e) {
//         var code = e.keyCode;
//
//         switch (code) {
//             case SHIFT_KEY:
//                 shiftKeyDown = true;
//                 break;
//             case CONTROL_KEY:
//             case COMMAND_KEY:
//                 modifierKeyDown = true;
//                 break;
//             case OPTION_KEY:
//                 optionKeyDown = true;
//                 canvas.style.cursor = "pointer";
//                 break;
//             case ENTER_KEY:
//                 if (document.activeElement !== document.body)
//                     document.activeElement.blur();
//                 break;
//         }
//
//         var objects = getCurrentContext().getObjects();
//         for (var i = 0; i < objects.length; i++) {
//             if (objects[i] instanceof Keyboard)
//                 objects[i].onKeyDown(code);
//         }
//
//         getCurrentContext().getHistoryManager().onKeyDown(code);
//         if (CurrentTool.onKeyDown(code))
//             render();
//     }
//     var onKeyUp = function(e) {
//         var code = e.keyCode;
//
//         switch (code) {
//             case SHIFT_KEY:
//                 shiftKeyDown = false;
//                 break;
//             case CONTROL_KEY:
//             case COMMAND_KEY:
//                 modifierKeyDown = false;
//                 break;
//             case OPTION_KEY:
//                 optionKeyDown = false;
//                 getCurrentContext().setCursor("default");
//                 break;
//         }
//
//         var objects = getCurrentContext().getObjects();
//         for (var i = 0; i < objects.length; i++) {
//             if (objects[i] instanceof Keyboard)
//                 objects[i].onKeyUp(code);
//         }
//
//         if (CurrentTool.onKeyUp(code))
//             render();
//     }
//     var onDoubleClick = function(e) {
//     }
//     var onWheel = function(e) {
//         var camera = getCurrentContext().getCamera();
//         var delta = -e.deltaY / 120.0;
//
//         var factor = 0.95;
//         if (delta < 0)
//             factor = 1 / factor;
//
//         var worldMousePos = camera.getWorldPos(mousePos);
//         camera.zoomBy(factor);
//         var newMousePos = camera.getScreenPos(worldMousePos);
//         var dx = (mousePos.x - newMousePos.x) * camera.zoom;
//         var dy = (mousePos.y - newMousePos.y) * camera.zoom;
//
//         camera.translate(-dx, -dy);
//
//         popup.onWheel();
//
//         render();
//     }
//     var onMouseDown = function(e) {
//         var canvas = getCurrentContext().getRenderer().canvas;
//         var rect = canvas.getBoundingClientRect();
//         isDragging = false;
//         startTapTime = Date.now();
//         mouseDown = true;
//         mouseDownPos = new Vector(e.clientX - rect.left, e.clientY - rect.top);
//
//         if (e.button === LEFT_MOUSE_BUTTON) {
//             var shouldRender = false;
//             contextmenu.hide();
//             shouldRender = CurrentTool.onMouseDown(shouldRender);
//             for (var i = 0; i < mouseListeners.length; i++) {
//                 var listener = mouseListeners[i];
//                 if (!listener.disabled && listener.onMouseDown(shouldRender))
//                     shouldRender = true;
//             }
//             if (shouldRender)
//                 render();
//         }
//     }
//     var onMouseMove = function(e) {
//         var canvas = getCurrentContext().getRenderer().canvas;
//         var camera = getCurrentContext().getCamera();
//         var rect = canvas.getBoundingClientRect();
//
//         prevMousePos.x = mousePos.x;
//         prevMousePos.y = mousePos.y;
//
//         rawMousePos = new Vector(e.clientX, e.clientY);
//         mousePos = new Vector(e.clientX - rect.left, e.clientY - rect.top);
//         worldMousePos = camera.getWorldPos(mousePos);
//
//         isDragging = (mouseDown && (Date.now() - startTapTime > 50));
//
//         var shouldRender = false;
//
//         if (optionKeyDown && isDragging) {
//             var pos = new Vector(mousePos.x, mousePos.y);
//             var dPos = mouseDownPos.sub(pos);
//             camera.translate(camera.zoom * dPos.x, camera.zoom * dPos.y);
//             mouseDownPos = mousePos;
//
//             popup.onMove();
//             shouldRender = true;
//         }
//
//         shouldRender = CurrentTool.onMouseMove(shouldRender) || shouldRender;
//         for (var i = 0; i < mouseListeners.length; i++) {
//             var listener = mouseListeners[i];
//             if (!listener.disabled && listener.onMouseMove(shouldRender))
//                 shouldRender = true;
//         }
//         if (shouldRender)
//             render();
//     }
//     var onMouseUp = function(e) {
//         mouseDown = false;
//
//         var shouldRender = false;
//         shouldRender = CurrentTool.onMouseUp(shouldRender);
//         for (var i = 0; i < mouseListeners.length; i++) {
//             var listener = mouseListeners[i];
//             if (!listener.disabled && listener.onMouseUp(shouldRender))
//                 shouldRender = true;
//         }
//         if (shouldRender)
//             render();
//     }
//     var onClick = function(e) {
//         var shouldRender = false;
//         shouldRender = CurrentTool.onClick(shouldRender);
//         for (var i = 0; i < mouseListeners.length; i++) {
//             var listener = mouseListeners[i];
//             if (!listener.disabled && listener.onClick(shouldRender))
//                 shouldRender = true;
//         }
//         if (shouldRender)
//             render();
//     }
//
//     window.addEventListener('keydown', e => {onKeyDown(e);}, false);
//     window.addEventListener('keyup', e => {onKeyUp(e);}, false);
//
//     return {
//         registerContext: function(ctx) {
//             var canvas = ctx.getRenderer().canvas;
//             canvas.addEventListener('click', e => onClick(e), false);
//             canvas.addEventListener('dblclick', e => onDoubleClick(e), false);
//             // if (browser.name !== "Firefox")
//                 canvas.addEventListener('wheel', e => onWheel(e), false);
//             // else
//             //     canvas.addEventListener('DOMMouseScroll', e => onWheel(e), false);
//             canvas.addEventListener('mousedown', e => onMouseDown(e), false);
//             canvas.addEventListener('mouseup', e => onMouseUp(e), false);
//             canvas.addEventListener('mousemove', e => onMouseMove(e), false);
//             canvas.addEventListener('mouseenter', e => { if (PlaceItemController.drag) { onMouseMove(e); onClick(e); PlaceItemController.drag = false; }}, false);
//             canvas.addEventListener("mouseleave", e => { allKeysUp(canvas); if (mouseDown) { onMouseUp(e); onClick(e); } });
//
//             canvas.addEventListener("contextmenu", function(e) {
//                 contextmenu.show(e);
//                 e.preventDefault();
//             });
//         },
//         addMouseListener: function(l) {
//             mouseListeners.push(l);
//         },
//         getWorldMousePos() {
//             return V(worldMousePos);
//         },
//         getRawMousePos() {
//             return V(rawMousePos);
//         },
//         getShiftKeyDown() {
//             return shiftKeyDown;
//         },
//         getModifierKeyDown() {
//             return modifierKeyDown;
//         },
//         getOptionKeyDown() {
//             return optionKeyDown;
//         },
//         getIsDragging() {
//             return isDragging;
//         }
//     }
// })();
