import {CircuitState, CircuitTypes} from "shared/api/circuit/public/impl/CircuitState";
import {Margin} from "math/Rect";
import {Cursor} from "shared/api/circuitdesigner/input/Cursor";
import {DebugOptions} from "./DebugOptions";
import {ToolManager} from "./ToolManager";
import {GUID} from "shared/api/circuit/public";
import {Schema} from "shared/api/circuit/schema";


export type CameraRecordKey = "main" | `ic/${GUID}:${"internal" | "display"}`;

export interface CircuitDesignerState<T extends CircuitTypes> {
    circuitState: CircuitState<T>;

    // SoT for the cameras
    curCamera: CameraRecordKey;
    cameras: Record<CameraRecordKey, Schema.Camera>;

    toolManager: ToolManager<T>;

    curPressedObj?: T["Obj"];
    cursor?: Cursor;
    margin: Margin;
    debugOptions: DebugOptions;
}
