import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


export const DeleteHandler: ToolHandler = {
    name: "DeleteHandler",

    onEvent: (ev, { circuit }) => {
        // Activate when pressing Delete or Backspace
        if (!(ev.type === "keydown" && (ev.key === "Delete" || ev.key === "Backspace")))
            return ToolHandlerResponse.PASS;

        // Nothing to delete
        if (circuit.selections.isEmpty)
            return ToolHandlerResponse.PASS;

        circuit.deleteObjs([...circuit.selections.components, ...circuit.selections.wires]);

        // This should be the only handler to execute
        return ToolHandlerResponse.HALT;
    },
}
