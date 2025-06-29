import {Node} from "shared/api/circuit/public";

import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


export const SnipNodesHandler: ToolHandler = {
    name: "SnipNodesHandler",

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
        nodes
            // Only get nodes with exactly 2 connections since those are the ones that are 'snippable'
            .filter((node) => (node.allPorts.flatMap((p) => p.connections)).length === 2)
            .forEach((node) => node.snip());
        circuit.commitTransaction("Snipped Node");

        // This should be the only handler to execute
        return ToolHandlerResponse.HALT;
    },
}
