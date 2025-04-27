import {CircuitState, CircuitTypes} from "shared/api/circuit/public/impl/CircuitState";
import {Margin} from "math/Rect";
import {DebugOptions} from "./DebugOptions";
import {ToolManager} from "./ToolManager";
import {Schema} from "shared/api/circuit/schema";


export interface CircuitDesignerState<T extends CircuitTypes> {
    circuitState: CircuitState<T>;

    // TODO[model_refactor_api] - move to CircuitInternal
    // SoT for the cameras
    camera: Schema.Camera;

    isLocked: boolean;
    toolManager: ToolManager<T>;

    curPressedObj?: T["Obj"];
    margin: Margin;
    debugOptions: DebugOptions;
}
