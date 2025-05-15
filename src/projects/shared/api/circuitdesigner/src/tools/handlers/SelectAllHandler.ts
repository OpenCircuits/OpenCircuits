import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


export const SelectAllHandler: ToolHandler = {
    onEvent: (ev, { circuit }) => {
        // Activate when pressing CTRL/CMD + A
        if (!(ev.type === "keydown" && ev.key === "a" && ev.input.isModifierKeyDown))
            return ToolHandlerResponse.PASS;

        const comps = circuit.getComponents();
        // Don't select all if nothing to select or everything is already selected
        // TODO[.](kevin) - is this necessary anymore? it was here to prevent unnecessary entries in the
        //                  action history, but will this be automatically detected now?
        if (comps.length === 0 || comps.length === circuit.selections.components.length)
            return ToolHandlerResponse.PASS;

        circuit.beginTransaction();
        comps.forEach((comp) => comp.select());
        circuit.commitTransaction("Selected All");

        // This should be the only handler to execute
        return ToolHandlerResponse.HALT;
    },
}
