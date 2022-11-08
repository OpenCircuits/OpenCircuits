import {Camera} from "math/Camera";

import {HistoryManager} from "core/actions/HistoryManager";

import {ToolManager} from "core/tools/ToolManager";

import {AnyObj} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";
import {ViewCircuitInfo}   from "core/views/BaseView";
import {ViewManager}       from "core/views/ViewManager";

import {GUID}              from "./GUID";
import {InputManager}      from "./InputManager";
import {RenderQueue}       from "./RenderQueue";
import {SelectionsWrapper} from "./SelectionsWrapper";


export type Cursor =
    "auto" | "default" | "none" | "context-menu" | "help" | "pointer" | "progress" | "wait" | "cell" |
    "crosshair" | "text" | "vertical-text" | "alias" | "copy" | "move" | "no-drop" | "not-allowed" |
    "e-resize" | "n-resize" | "ne-resize" | "nw-resize" | "s-resize" | "se-resize" | "sw-resize" |
    "w-resize" | "ew-resize" | "ns-resize" | "nesw-resize" | "nwse-resize" | "col-resize" | "row-resize" |
    "all-scroll" | "zoom-in" | "zoom-out" | "grab" | "grabbing";

// type UserState = {
//     locked: boolean;
//     cursor?: Cursor;
//     camera: Camera;
//     selections: SelectionsWrapper;
// }

// type AppState<Obj extends AnyObj = AnyObj> = {
//     user: UserState;
//     circuit: Circu
// }

export type CircuitInfo<Obj extends AnyObj = AnyObj> = {
    locked: boolean;
    cursor?: Cursor;

    input: InputManager;
    camera: Camera;

    history: HistoryManager;

    circuit: CircuitController<Obj>;
    viewManager: ViewManager<Obj, ViewCircuitInfo<CircuitController<Obj>>>;

    selections: SelectionsWrapper;
    curPressedObjID?: GUID;

    toolManager: ToolManager;

    renderer: RenderQueue;

    debugOptions: {
        debugCullboxes: boolean;
        debugPressableBounds: boolean;
        debugSelectionBounds: boolean;
        debugNoFill: boolean;
    };
}
