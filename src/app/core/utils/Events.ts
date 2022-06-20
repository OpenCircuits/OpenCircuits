import {Vector} from "Vector";

import {Key} from "./Key";


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

    "paste"       |
    "copy"        |
    "cut"         |

    "keydown"     |
    "keyup";


export type MouseEvent = {
    type: "click" | "dblclick" | "mousedown" | "mousedrag" | "mouseup";
    button: number;
}
export type KeyboardEvent = {
    type: "keydown" | "keyup";
    key: Key;
}
export type ZoomEvent = {
    type: "zoom";
    factor: number;
    pos: Vector;
}
export type CopyPasteEvent = {
    type: "paste" | "copy" | "cut";
    ev: ClipboardEvent;
}
export type OtherEvent = {
    type: "mouseenter" | "mousemove" | "mouseleave" | "contextmenu" | "unknown";
}

export type Event = MouseEvent | KeyboardEvent | ZoomEvent | CopyPasteEvent | OtherEvent;
