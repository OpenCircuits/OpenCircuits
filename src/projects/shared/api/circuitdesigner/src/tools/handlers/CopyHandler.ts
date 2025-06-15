import {ObjContainer} from "shared/api/circuit/public/ObjContainer";

import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


export const CopyHandler = (serialize: (objs: ObjContainer) => string): ToolHandler => ({
    onEvent: (ev, { circuit }) => {
        // Activate when copy or cut events are fired
        if (!(ev.type === "copy" || ev.type === "cut"))
            return ToolHandlerResponse.PASS;

        // Nothing to copy
        if (circuit.selections.isEmpty)
            return ToolHandlerResponse.PASS;

        const clipboardData = ev.ev.clipboardData;
        if (!clipboardData)
            throw new Error("CopyHandler failed: ev.clipboardData is null!");

        const objs = circuit.selections.withWiresAndPorts();
        if (objs.components.length === 0)
            return ToolHandlerResponse.PASS;

        const str = serialize(objs);

        // We don't copy the data from the json since it will cause
        // some weird error, which will cause the issue #746
        clipboardData.setData("text/plain", str);
        ev.ev.preventDefault(); // Necessary to copy correctly

        // Delete selections if cutting
        if (ev.type === "cut")
            circuit.deleteObjs([...objs.wires, ...objs.components]);

        // This should be the only handler to execute
        return ToolHandlerResponse.HALT;
    },
});
