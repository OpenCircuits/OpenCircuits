import {CircuitState, CircuitTypes} from "shared/api/circuit/public/impl/CircuitState";
import {Margin} from "math/Rect";
import {DebugOptions} from "./DebugOptions";
import {ToolManager} from "./ToolManager";
import {Schema} from "shared/api/circuit/schema";


export interface CircuitDesignerState<T extends CircuitTypes> {
    circuitState: CircuitState<T>;

    // SoT for the cameras
    camera: Schema.Camera;

    toolManager: ToolManager<T>;

    curPressedObj?: T["Obj"];
    margin: Margin;
    debugOptions: DebugOptions;
}
