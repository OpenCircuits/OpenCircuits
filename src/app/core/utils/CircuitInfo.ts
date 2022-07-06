import {Camera} from "math/Camera";

import {HistoryManager} from "core/actions/HistoryManager";

import {ToolManager} from "core/tools/ToolManager";

import {CircuitDesigner} from "core/models";

import {Input}             from "./Input";
import {RenderQueue}       from "./RenderQueue";
import {Selectable}        from "./Selectable";
import {SelectionsWrapper} from "./SelectionsWrapper";


export type Cursor =
    "auto" | "default" | "none" | "context-menu" | "help" | "pointer" | "progress" | "wait" | "cell" |
    "crosshair" | "text" | "vertical-text" | "alias" | "copy" | "move" | "no-drop" | "not-allowed" |
    "e-resize" | "n-resize" | "ne-resize" | "nw-resize" | "s-resize" | "se-resize" | "sw-resize" |
    "w-resize" | "ew-resize" | "ns-resize" | "nesw-resize" | "nwse-resize" | "col-resize" | "row-resize" |
    "all-scroll" | "zoom-in" | "zoom-out" | "grab" | "grabbing";


export type CircuitInfo = {
    locked: boolean;
    cursor?: Cursor;

    input: Input;
    camera: Camera;

    history: HistoryManager;

    designer: CircuitDesigner;

    selections: SelectionsWrapper;
    currentlyPressedObject?: Selectable;

    toolManager: ToolManager;

    renderer: RenderQueue;

    debugOptions: {
        debugCullboxes: boolean;
        debugPressableBounds: boolean;
        debugSelectionBounds: boolean;
        debugNoFill: boolean;
    };
}
