import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


export const UndoHandler: ToolHandler = {
    name: "UndoHandler",

    onEvent: (ev, { circuit }) => {
        // Activate when pressing CTRL/CMD + Z
        if (!(ev.type === "keydown" && ev.key === "z" && ev.input.isModifierKeyDown))
            return ToolHandlerResponse.PASS;

        circuit.undo();

        // This should be the only handler to execute
        return ToolHandlerResponse.HALT;
    },
}
