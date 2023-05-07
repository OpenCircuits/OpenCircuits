import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


export const RedoHandler: ToolHandler = {
    onEvent: (ev, { circuit }) => {
        // Activate when pressing CTRL/CMD + Shift + Z or CTRL/CMD + Y
        if (!(ev.type === "keydown" && (ev.key === "z" && ev.input.isModifierKeyDown && ev.input.isShiftKeyDown ||
                                        ev.key === "y" && ev.input.isModifierKeyDown)))
            return ToolHandlerResponse.PASS;

        circuit.redo();

        // This should be the only handler to execute
        return ToolHandlerResponse.HALT;
    },
}
