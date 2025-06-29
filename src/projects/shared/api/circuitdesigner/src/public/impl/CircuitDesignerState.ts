import {CircuitState, CircuitTypes} from "shared/api/circuit/public/impl/CircuitState";
import {Margin} from "math/Rect";
import {DebugOptions} from "./DebugOptions";
import {ToolManager} from "./ToolManager";


export interface CircuitDesignerState<T extends CircuitTypes> {
    circuitState: CircuitState<T>;

    isLocked: boolean;
    toolManager: ToolManager<T>;

    curPressedObj?: T["Obj"];
    margin: Margin;
    debugOptions: DebugOptions;
}
