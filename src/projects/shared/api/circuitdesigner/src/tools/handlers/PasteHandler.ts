/* eslint-disable sonarjs/prefer-single-boolean-return */
import {Schema} from "shared/api/circuit/schema";
import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";
import {V} from "Vector";


function IsCircuit(data: any): data is Schema.Circuit {
    // TODO[model_refactor](leon) - validate schema better
    if (typeof data !== "object")
        return false;
    if (!("metadata" in data && "camera" in data && "ics" in data && "objects" in data))
        return false;
    if (typeof data["metadata"] !== "object")
        return false;
    if (typeof data["camera"] !== "object")
        return false;
    if (typeof data["ics"] !== "object")
        return false;
    if (typeof data["objects"] !== "object")
        return false;
    return true;
}

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

        try {
            const pastedCircuit = JSON.parse(data);
            if (!IsCircuit(pastedCircuit))
                return ToolHandlerResponse.PASS;

            // If the data is identical to the last paste, offset the paste
            // TODO(master): This is a hard problem :/
            //  Ideally it would be great:
            //  - "if any pasted component has the exact same position as an existing component, offset the whole set"
            //    However this requires looping through the entire circuit repeatedly since it needs
            //    to do continue to offset it as it continues to overlap
            //  - Alternatively we could just check that the currently selected objects have an equivalence (in a
            //    graph sense since IDs wont be the same) and then offset it?
            //  - Or we could maybe edit the clipboard when we paste and keep a tracker in there somehow?
            const offsetAmount = 0;
            // const shouldDoOffset = (data === PasteHandler.prevClipboardData);
            // const shouldDoOffset = (() => {
            //     const curSelectedObjs = circuit.selections.withWiresAndPorts().all;
            //     const pastedObjs = pastedCircuit.objects;
            //     if (curSelectedObjs.length !== pastedObjs.length)
            //         return false;
            //     const ids1 = new Set(curSelectedObjs.map((o) => o.id));
            //     const ids2 = new Set(pastedObjs.map((o) => o.id));
            //     return ids1.symmetricDifference(ids2).size === 0;
            // })();

            circuit.beginTransaction();
            circuit.selections.clear();
            const newObjs = circuit.loadSchema(pastedCircuit, { refreshIds: true });
            // Select the new components only (and offset them)
            newObjs.forEach((o) => {
                if (o.baseKind === "Component") {
                    o.select();
                    if (offsetAmount > 0)
                        o.pos = o.pos.add(V(0.5, -0.5).scale(offsetAmount));
                }
            });
            circuit.commitTransaction("Paste Handler");

            // This should be the only handler to execute
            return ToolHandlerResponse.HALT;
        } catch {
            return ToolHandlerResponse.PASS;
        }
    },
}
