import {Circuit} from "core/public";

import {CircuitDesignerImpl, ToolConfig} from "./impl/CircuitDesigner";


export * from "./CircuitDesigner";

export function CreateDesigner<Circ extends Circuit>(circuit: Circ, toolConfig: ToolConfig) {
    return new CircuitDesignerImpl(circuit, toolConfig);
}
