import {V}                                from "Vector";
import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


export const DuplicateHandler: ToolHandler = {
    onEvent: (ev, { circuit }) => {
        // Activate when pressing CTRL/CMD + D
        if (!(ev.type === "keydown" && ev.key === "d" && ev.input.isModifierKeyDown))
            return ToolHandlerResponse.PASS;

        // Nothing to duplicate
        if (circuit.selections.isEmpty)
            return ToolHandlerResponse.PASS;

        circuit.beginTransaction();

        const duplicates = circuit.selections.duplicate();
        circuit.selections.clear();
        duplicates.forEach((obj) => obj.select());
        duplicates.forEach((obj) => {
            // Offset the duplicates slightly
            if (obj.baseKind === "Component")
                obj.pos = obj.pos.add(V(0.5, 0.5));
        });

        circuit.commitTransaction();

        // This should be the only handler to execute
        return ToolHandlerResponse.HALT;
    },
}