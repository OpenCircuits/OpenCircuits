import {SHIFT_KEY,
        ENTER_KEY,
        CONTROL_KEY,
        OPTION_KEY,
        COMMAND_KEY,
        DRAG_TIME} from "./Constants";

import {Vector,V} from "../utils/math/Vector";

export class Input {
    canvas: HTMLCanvasElement;
    prevMousePos: Vector;
    rawMousePos: Vector;
    mousePos: Vector;

    isMouseDown: boolean;
    mouseDownPos: Vector;

    isDragging: boolean;
    startTapTime: number;

    listeners: Map<string, Array<(b: number) => void> >;

    keysDown: Map<number, boolean>;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.listeners = new Map();
        this.keysDown = new Map();

        window.addEventListener('keydown',  (e: KeyboardEvent) => this.onKeyDown(e), false);
        window.addEventListener('keyup',    (e: KeyboardEvent) => this.onKeyDown(e), false);

        canvas.addEventListener('click',        (e: MouseEvent) => this.onClick(e),         false);
        canvas.addEventListener('dblclick',     (e: MouseEvent) => this.onDoubleClick(e),   false);
        canvas.addEventListener('wheel',        (e: MouseEvent) => this.onScroll(e),        false);
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
    addListener(type: string, listener: (b: number) => void): void {
        var arr = this.listeners.get(type);
        if (arr == undefined)
            this.listeners.set(type, arr = []);
        arr.push(listener);
    }
    isKeyDown(key: number): boolean {
        return (this.keysDown.get(key) != null &&
                this.keysDown.get(key) == true);
    }
    getMousePos(): Vector {
        return V(this.mousePos);
    }

    onKeyDown(event: KeyboardEvent): void {

    }
    onKeyUp(event: KeyboardEvent): void {

    }
    onClick(event: MouseEvent): void {

    }
    onDoubleClick(event: MouseEvent): void {

    }
    onScroll(event: MouseEvent): void {

    }
    onMouseDown(event: MouseEvent): void {
        var rect = this.canvas.getBoundingClientRect();

        // reset dragging and set mouse stuff
        this.isDragging = false;
        this.startTapTime = Date.now();
        this.isMouseDown = true;
        this.mouseDownPos = V(event.clientX - rect.left,
                               event.clientY - rect.top);

        // call each listener
        this.callListeners("mousedown", 0);
    }
    onMouseUp(event: MouseEvent): void {

    }
    onMouseMove(event: MouseEvent): void {
        var rect = this.canvas.getBoundingClientRect();

        // get raw and relative mouse positions
        this.prevMousePos = V(this.mousePos);
        this.rawMousePos = V(event.clientX, event.clientY);
        this.mousePos = this.rawMousePos.sub(V(rect.left, rect.top));

        // determine if mouse is dragging
        this.isDragging = (this.isMouseDown) && (Date.now() - this.startTapTime > DRAG_TIME);

        // call listeners
        if (this.isDragging)
            this.callListeners("mousedrag", 0);
        this.callListeners("mousemove", 0);
    }
    onMouseEnter(event: MouseEvent): void {

    }
    onMouseLeave(event: MouseEvent): void {

    }
    callListeners(type: string, b: number) {
        // call all listeners of type
        var listeners = this.listeners.get(type);
        if (listeners != undefined) {
            for (var listener of listeners)
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
