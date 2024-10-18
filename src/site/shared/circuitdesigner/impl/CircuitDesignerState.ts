import {CircuitState, CircuitTypes} from "core/public/api/impl/CircuitState";
import {Margin} from "math/Rect";
import {Cursor} from "shared/utils/input/Cursor";
import {DebugOptions} from "./DebugOptions";
import {ToolManager} from "./ToolManager";
import {GUID} from "core/public";
import {Schema} from "core/schema";


export type CameraRecordKey = "main" | `ic/${GUID}:${"internal" | "display"}`;

export interface CircuitDesignerState<T extends CircuitTypes> {
    circuitState: CircuitState<T>;

    // SoT for the cameras
    curCamera: CameraRecordKey;
    cameras: Record<CameraRecordKey, Schema.Camera>;

    toolManager: ToolManager;

    curPressedObj?: T["Obj"];
    cursor?: Cursor;
    margin: Margin;
    debugOptions: DebugOptions;
}
