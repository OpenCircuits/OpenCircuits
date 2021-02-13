import {BACKSPACE_KEY, DELETE_KEY} from "core/utils/Constants";

import {Event} from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";

import {GroupAction} from "core/actions/GroupAction";
import {CreateDeselectAllAction} from "core/actions/selection/SelectAction";
import {CreateDeleteGroupAction} from "core/actions/deletion/DeleteGroupActionFactory";

import {IOObject} from "core/models";

import {EventHandler} from "../EventHandler";


export const DeleteHandler: EventHandler = ({
    conditions: (event: Event, {selections}: CircuitInfo) =>
        (event.type === "keydown" &&
         (event.key === DELETE_KEY || event.key === BACKSPACE_KEY) &&
         selections.amount() > 0),

    getResponse: ({history, designer, selections}: CircuitInfo) => {
        const objs = selections.get().filter(o => o instanceof IOObject) as IOObject[];

        // Deselect the objects then remove them
        history.add(new GroupAction([
            CreateDeselectAllAction(selections).execute(),
            CreateDeleteGroupAction(designer, objs).execute()
        ]));
    }
});
