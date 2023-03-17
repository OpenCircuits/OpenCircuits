import {Circuit} from "core/public";

import {DefaultTool} from "shared/tools/DefaultTool";
import {Tool}        from "shared/tools/Tool";

import {CircuitDesignerImpl} from "./impl/CircuitDesigner";


export * from "./CircuitDesigner";

export function CreateDesigner<Circ extends Circuit>(circuit: Circ, toolConfig: {
    defaultTool: DefaultTool;
    tools: Tool[];
}) {
    return new CircuitDesignerImpl(circuit, toolConfig);
}
