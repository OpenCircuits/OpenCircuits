import {CircuitInfo}           from "core/utils/CircuitInfo";
import {SerializeForCopy}      from "core/utils/ComponentUtils";
import {CopyPasteEvent, Event} from "core/utils/Events";

import {GroupAction} from "core/actions/GroupAction";

import {DeleteGroup} from "core/actions/compositions/DeleteGroup";

import {DeselectAll} from "core/actions/units/Select";

import {IOObject} from "core/models";

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

    getResponse: ({ selections, designer, history }: CircuitInfo, { type, ev }: CopyPasteEvent) => {
        const objs = selections.get().filter((o) => o instanceof IOObject) as IOObject[];

        const str = SerializeForCopy(objs);

        if (!ev.clipboardData)
            throw new Error("CopyHandler.getResponse failed: ev.clipboardData is null");

        // We don't copy the data from the json since it will cause
        // some weird error, which will cause the issue #746
        ev.clipboardData.setData("text/plain", str);
        ev.preventDefault(); // Necessary to copy correctly

        if (type === "cut") {
            // Delete selections
            history.add(new GroupAction([
                DeselectAll(selections),
                DeleteGroup(designer, objs),
            ], "Copy Handler"));
        }
    },
});
