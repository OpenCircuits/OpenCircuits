import {Event} from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";

import {GroupAction} from "core/actions/GroupAction";
import {CreateDeselectAllAction} from "core/actions/selection/SelectAction";
import {CreateDeleteGroupAction} from "core/actions/deletion/DeleteGroupActionFactory";

import {IOObject, Wire} from "core/models";

import {EventHandler} from "../EventHandler";
import {IOObjectSet} from "core/utils/ComponentUtils";

/**
 * Checks to see if a the backspace or delte key is pressed on a selected objects and then deletes the objects.
 * @param event is the event of the key press
 * @param selections are the selected objects that the action is being done on.
 */
export const DeleteHandler: EventHandler = ({
    conditions: (event: Event, {selections}: CircuitInfo) =>
         (event.type === "keydown" &&
         (event.key === "Delete" || event.key === "Backspace") &&
         selections.amount() > 0),
    getResponse: ({history, designer, selections}: CircuitInfo) => {
        const objs = selections.get().filter(o => o instanceof IOObject) as IOObject[];        
        // Deselect the objects then remove them
        history.add(new GroupAction([
            CreateDeselectAllAction(selections).execute(),

            CreateDeleteGroupAction(designer, objs).execute()
        ], "Delete Handler"));

    }
});
