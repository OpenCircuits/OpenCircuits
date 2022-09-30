import {CircuitInfo}           from "core/utils/CircuitInfo";
import {SerializeForCopy}      from "core/utils/ComponentUtils";
import {CopyPasteEvent, Event} from "core/utils/Events";

import {GroupAction} from "core/actions/GroupAction";

import {DeleteGroup} from "core/actions/compositions/DeleteGroup";

import {DeselectAll} from "core/actions/units/Select";

import {IOObject} from "core/models";

import {AnyComponent} from "core/models/types";

import {EventHandler} from "../EventHandler";


export const CopyHandler: EventHandler = ({
    conditions: (event: Event, { selections }: CircuitInfo) =>
        ((event.type === "copy" || event.type === "cut") &&
         selections.amount() > 0) &&
        // If a label element is not selected,
        // or if an editable component is selected but it is a "Caret" (cursor) instead of highlighted text,
        // then copy the component
        // Otherwise there is text selected, so do default copying
        // Necessary to fix #874
        (document.getSelection()?.anchorNode?.nodeName !== "LABEL" ||
         document.getSelection()?.type === "Caret"),

    getResponse: ({ circuit, selections, history }: CircuitInfo, { type, ev }: CopyPasteEvent) => {
        if (!ev.clipboardData)
            throw new Error("CopyHandler.getResponse failed: ev.clipboardData is unavailable");

        const comps = selections.get()
            .map((id) => circuit.getObj(id)!)
            .filter((o) => (o.baseKind === "Component"))
            // Filter out nodes since we can't strictly copy them
            .filter((c) => (c.kind !== circuit.getNodeKind())) as AnyComponent[];

        if (comps.length === 0)
            return;

        // Go through each component
        //  Get each path (wires + nodes) to every other component (if it exists)
        // This set of components/nodes, ports, and wires is what we should serialize
        // Make sure to delete the original if "cutting"
    },
});
