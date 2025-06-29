import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


export const DeselectAllHandler: ToolHandler = {
    name: "DeselectAllHandler",

    onEvent: (ev, { circuit }) => {
        // Activate when pressing Escape
        if (!(ev.type === "keydown" && ev.key === "Escape"))
            return ToolHandlerResponse.PASS;

        // Don't deselect all if nothing selected
        if (circuit.selections.isEmpty)
            return ToolHandlerResponse.PASS;

        circuit.beginTransaction();
        circuit.selections.forEach((obj) => obj.deselect());
        circuit.commitTransaction("Deselected All");

        // This should be the only handler to execute
        return ToolHandlerResponse.HALT;
    },
}
