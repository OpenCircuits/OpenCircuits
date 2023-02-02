import {Vector} from "Vector";

import {Key} from "./Key";


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
