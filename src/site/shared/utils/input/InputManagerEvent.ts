import {Vector}            from "Vector";
import {InputManagerState} from "./InputManagerState";

import {Key} from "./Key";


export interface BaseInputEvent {
    state: InputManagerState;
}
export interface MouseInputEvent extends BaseInputEvent {
    type: "click" | "dblclick" | "mousedown" | "mousedrag" | "mouseup";
    button: number;
}
export interface KeyboardInputEvent extends BaseInputEvent {
    type: "keydown" | "keyup";
    key: Key;
}
export interface ZoomInputEvent extends BaseInputEvent {
    type: "zoom";
    factor: number;
    pos: Vector;
}
export interface CopyPasteInputEvent extends BaseInputEvent {
    type: "paste" | "copy" | "cut";
    ev: ClipboardEvent;
}
export interface OtherInputEvent extends BaseInputEvent {
    type: "mouseenter" | "mousemove" | "mouseleave" | "contextmenu" | "unknown";
}

export type InputManagerEvent =
    MouseInputEvent | KeyboardInputEvent | ZoomInputEvent | CopyPasteInputEvent | OtherInputEvent;
export type InputManagerEventType = InputManagerEvent["type"];
