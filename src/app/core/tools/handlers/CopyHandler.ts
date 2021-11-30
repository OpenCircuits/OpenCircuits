import {CopyPasteEvent, Event} from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";
import {SerializeForCopy} from "core/utils/ComponentUtils";

import {GroupAction} from "core/actions/GroupAction";
import {CreateDeselectAllAction} from "core/actions/selection/SelectAction";
import {CreateDeleteGroupAction} from "core/actions/deletion/DeleteGroupActionFactory";

import {IOObject} from "core/models";

import {EventHandler} from "../EventHandler";


export const CopyHandler: EventHandler = ({
    conditions: (event: Event, {selections}: CircuitInfo) =>
        ((event.type === "copy" || event.type === "cut") &&
         selections.amount() > 0),

    getResponse: ({selections, designer, history}: CircuitInfo, {type, ev}: CopyPasteEvent) => {
        const objs = selections.get().filter(o => o instanceof IOObject) as IOObject[];

        const str = SerializeForCopy(objs);
        // We don't copy the data from the json since it will cause 
        // some weird error, which will cause the issue #746
        ev.clipboardData.setData("text/plain", str);
        ev.preventDefault(); // Necessary to copy correctly

        if (type === "cut") {
            // Delete selections
            history.add(new GroupAction([
                CreateDeselectAllAction(selections),
                CreateDeleteGroupAction(designer, objs)
            ]).execute());
        }
    }
});
