import {Circuit}                          from "shared/api/circuit/public";
import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


export function DuplicateSelections(circuit: Circuit): void {
    const objs = circuit.selections.withWiresAndPorts();
    if (objs.components.length === 0)
        return;

    circuit.beginTransaction();

    circuit.selections.clear();
    const newObjs = circuit.import(objs, { refreshIds: true });
    newObjs.components.forEach((obj) => {
        // Offset the duplicates slightly
        obj.select();
        obj.pos = obj.pos.add(0.5, -0.5);
    });

    circuit.commitTransaction("Duplicated Selection");
}

export const DuplicateHandler: ToolHandler = {
    onEvent: (ev, { circuit }) => {
        // Activate when pressing CTRL/CMD + D
        if (!(ev.type === "keydown" && ev.key === "d" && ev.input.isModifierKeyDown))
            return ToolHandlerResponse.PASS;

        // Nothing to duplicate
        if (circuit.selections.isEmpty)
            return ToolHandlerResponse.PASS;

        DuplicateSelections(circuit);

        // This should be the only handler to execute
        return ToolHandlerResponse.HALT;
    },
}
