import {CircuitInfo}       from "core/utils/CircuitInfo";
import {InputManagerEvent} from "core/utils/InputManager";

import {GroupAction} from "core/actions/GroupAction";

import {DeleteGroup} from "core/actions/compositions/DeleteGroup";

import {DeselectAll} from "core/actions/units/Select";

import {EventHandler} from "../EventHandler";


/**
 * Checks to see if a the backspace or delte key is pressed on a selected objects and then deletes the objects.
 *
 * @param event      Is the event of the key press.
 * @param selections Are the selected objects that the action is being done on.
 */
export const DeleteHandler: EventHandler = ({
    conditions: (event: InputManagerEvent, { selections }: CircuitInfo) =>
         (event.type === "keydown" &&
         (event.key === "Delete" || event.key === "Backspace") &&
         selections.amount() > 0),

    getResponse: ({ circuit, history, selections }: CircuitInfo) => {
        const objs = selections.get()
            .map((id) => circuit.getObj(id)!)
            // Don't allow user to explicitly delete ports
            .filter((o) => (o.baseKind !== "Port"));

        // Deselect the objects then remove them
        history.add(new GroupAction([
            DeselectAll(selections),
            DeleteGroup(circuit, objs),
        ], "Delete Handler"));
    },
});
