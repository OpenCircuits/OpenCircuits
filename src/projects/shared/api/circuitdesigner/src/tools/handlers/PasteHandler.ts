import {V, Vector} from "Vector";

import {Circuit} from "shared/api/circuit/public";

import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


export function DoPaste(circuit: Circuit, pastedCircuit: Circuit, offset?: Vector) {
    circuit.beginTransaction();
    circuit.selections.clear();
    const newObjs = circuit.import(pastedCircuit, { refreshIds: true });
    // Offset, Select, and shift the components
    if (offset) {
        newObjs.components.forEach((o) =>
            (o.pos = o.pos.add(offset)));
    }
    newObjs.shift();
    newObjs.select();
    circuit.commitTransaction("Pasted from Clipboard");
}

export const PasteHandler = (deserialize: (str: string) => Circuit): ToolHandler => ({
    name: "PasteHandler",

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
            const pastedCircuit = deserialize(data);

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

            DoPaste(circuit, pastedCircuit, offsetAmount ? V(0.5, -0.5).scale(offsetAmount) : undefined);

            // This should be the only handler to execute
            return ToolHandlerResponse.HALT;
        } catch {
            return ToolHandlerResponse.PASS;
        }
    },
});
