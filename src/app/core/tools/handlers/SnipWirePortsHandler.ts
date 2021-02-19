import {X_KEY} from "core/utils/Constants";

import {Event} from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";

import {GroupAction} from "core/actions/GroupAction";
import {CreateDeselectAllAction} from "core/actions/selection/SelectAction";
import {CreateGroupSnipAction} from "core/actions/addition/SplitWireAction";

import {isNode, Node} from "core/models";

import {EventHandler} from "../EventHandler";


export const SnipWirePortsHandler: EventHandler = ({
    conditions: (event: Event, {selections}: CircuitInfo) =>
        (event.type === "keydown" &&
         event.key === X_KEY &&
         selections.amount() > 0 &&
         selections.all(o => isNode(o))),

    getResponse: ({history, designer, selections}: CircuitInfo) => {
        const ports = selections.get().filter(o => isNode(o)) as Node[];

        // Deselect the ports and then snip them
        history.add(new GroupAction([
            CreateDeselectAllAction(selections).execute(),
            CreateGroupSnipAction(designer, ports).execute()
        ]));
    }
});
