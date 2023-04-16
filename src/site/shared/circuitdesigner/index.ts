import {Circuit} from "core/public";

import {CircuitDesignerImpl, ToolConfig} from "./impl/CircuitDesigner";


export * from "./CircuitDesigner";

export function CreateDesigner<CircuitT extends Circuit>(circuit: CircuitT, toolConfig: ToolConfig) {
    return new CircuitDesignerImpl(circuit, toolConfig);
}
