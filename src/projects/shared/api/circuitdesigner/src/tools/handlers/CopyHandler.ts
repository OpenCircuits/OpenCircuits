import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


export const CopyHandler: ToolHandler = {
    onEvent: (ev, { circuit }) => {
        // Activate when copy or cut events are fired
        if (!(ev.type === "copy" || ev.type === "cut"))
            return ToolHandlerResponse.PASS;

        // If a label element is not selected,
        // or if an editable component is selected but it is a "Caret" (cursor) instead of highlighted text,
        // then copy the component
        // Otherwise there is text selected, so do default copying
        // Necessary to fix #874
        // TODO[model_refactor](leon) - Maybe see if we can just not fire the copy/cut events in InputAdapter
        //                              when the canvas doesn't have focus ? And/or just do this in InputAdapter
        const sel = document.getSelection();
        if (sel?.anchorNode?.nodeName === "LABEL" && sel?.type !== "Caret")
            return ToolHandlerResponse.PASS;

        // Nothing to copy
        if (circuit.selections.isEmpty)
            return ToolHandlerResponse.PASS;

        const str = circuit.serialize(circuit.selections.all);

        const clipboardData = ev.ev.clipboardData;
        if (!clipboardData)
            throw new Error("CopyHandler failed: ev.clipboardData is null!");

        // We don't copy the data from the json since it will cause
        // some weird error, which will cause the issue #746
        clipboardData.setData("text/plain", str);
        ev.ev.preventDefault(); // Necessary to copy correctly

        // Delete selections if cutting
        if (ev.type === "cut")
            circuit.deleteObjs(circuit.selections.all);

        // This should be the only handler to execute
        return ToolHandlerResponse.HALT;
    },
}
