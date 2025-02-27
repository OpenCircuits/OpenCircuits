import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


export const PasteHandler: ToolHandler = {
    onEvent: (ev, { circuit }) => {
        // Activate when paste event is fired
        if (!(ev.type === "paste"))
            return ToolHandlerResponse.PASS;

        const clipboardData = ev.ev.clipboardData;
        if (!clipboardData)
            throw new Error("PasteHandler failed: ev.clipboardData is null!");

        const data = clipboardData.getData("text/plain");
        if (data.length === 0) // Nothing in clipboard
            return ToolHandlerResponse.PASS;

        // TODO[model_refactor](leon) - figure out pasting API
        // circuit.deserialize(data);

        // This should be the only handler to execute
        return ToolHandlerResponse.HALT;
    },
}
