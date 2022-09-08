import {CircuitInfo} from "core/utils/CircuitInfo";
import {Event}       from "core/utils/Events";

import {GroupAction} from "core/actions/GroupAction";

import {DeleteGroup} from "core/actions/compositions/DeleteGroup";

import {DeselectAll} from "core/actions/units/Select";

import {IOObject} from "core/models";

import {EventHandler} from "../EventHandler";


/**
 * Checks to see if a the backspace or delte key is pressed on a selected objects and then deletes the objects.
 *
 * @param event      Is the event of the key press.
 * @param selections Are the selected objects that the action is being done on.
 */
export const DeleteHandler: EventHandler = ({
    conditions: (event: Event, { selections }: CircuitInfo) =>
         (event.type === "keydown" &&
         (event.key === "Delete" || event.key === "Backspace") &&
         selections.amount() > 0),

    getResponse: ({ history, designer, selections }: CircuitInfo) => {
        const objs = selections.get().filter((o) => o instanceof IOObject) as IOObject[];
        // Deselect the objects then remove them
        history.add(new GroupAction([
            DeselectAll(selections),
            DeleteGroup(designer, objs),
        ], "Delete Handler"));
    },
});
