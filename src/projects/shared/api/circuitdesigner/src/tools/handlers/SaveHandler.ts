import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


export const SaveHandler = (save: () => void): ToolHandler => ({
    onEvent: (ev) => {
        // Activate when pressing CTRL/CMD + S
        if (!(ev.type === "keydown" && ev.key === "s" && ev.input.isModifierKeyDown))
            return ToolHandlerResponse.PASS;

        save();

        // This should be the only handler to execute
        return ToolHandlerResponse.HALT;
    },
});
