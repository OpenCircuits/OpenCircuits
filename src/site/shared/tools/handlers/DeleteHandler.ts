import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


export const DeleteHandler: ToolHandler = {
    onEvent: (ev, { circuit }) => {
        // Activate when pressing Delete or Backspace
        if (!(ev.type === "keydown" && (ev.key === "Delete" || ev.key === "Backspace")))
            return ToolHandlerResponse.PASS;

        // Nothing to delete
        if (circuit.selections.isEmpty)
            return ToolHandlerResponse.PASS;

        circuit.deleteObjs(circuit.selections.all);

        // This should be the only handler to execute
        return ToolHandlerResponse.HALT;
    },
}
