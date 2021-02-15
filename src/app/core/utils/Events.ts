import {Vector} from "Vector";


export type EventType =
    "click"       |
    "dblclick"    |

    "mouseenter"  |
    "mousemove"   |
    "mousedown"   |
    "mousedrag"   |
    "mouseup"     |
    "mouseleave"  |
    "zoom"        |

    "contextmenu" |

    "keydown"     |
    "keyup";


export type MouseEvent = {
    type: "click" | "dblclick" | "mousedown" | "mousedrag" | "mouseup";
    button: number;
}
export type KeyboardEvent = {
    type: "keydown" | "keyup";
    key: number;
}
export type ZoomEvent = {
    type: "zoom";
    factor: number;
    pos: Vector;
}
export type OtherEvent = {
    type: "mouseenter" | "mousemove" | "mouseleave" | "contextmenu" | "unknown";
}

export type Event = MouseEvent | KeyboardEvent | ZoomEvent | OtherEvent;
