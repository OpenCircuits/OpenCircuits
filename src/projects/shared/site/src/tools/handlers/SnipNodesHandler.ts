import {Node} from "core/public";

import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


export const SnipNodesHandler: ToolHandler = {
    onEvent: (ev, { circuit }) => {
        // Activate when pressing X key
        if (!(ev.type === "keydown" && ev.key === "x"))
            return ToolHandlerResponse.PASS;

        // Nothing to snip
        if (circuit.selections.isEmpty)
            return ToolHandlerResponse.PASS;

        // Selecting any non-nodes
        if (!circuit.selections.every((o) => (o.baseKind === "Component" && o.isNode())))
            return ToolHandlerResponse.PASS;

        const nodes = circuit.selections.components as Node[];

        circuit.beginTransaction();
        nodes.forEach((node) => node.snip());
        circuit.commitTransaction();

        // This should be the only handler to execute
        return ToolHandlerResponse.HALT;
    },
}
