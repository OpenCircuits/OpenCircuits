import {CircuitInfo} from "core/utils/CircuitInfo";
import {Event}       from "core/utils/Events";

import {GroupAction} from "core/actions/GroupAction";

import {SnipGroup} from "core/actions/compositions/SplitWire";

import {DeselectAll} from "core/actions/units/Select";

import {Node, isNode} from "core/models";

import {EventHandler} from "../EventHandler";


export const SnipWirePortsHandler: EventHandler = ({
    conditions: (event: Event, { selections }: CircuitInfo) =>
        (event.type === "keydown" &&
         event.key === "x" &&
         selections.amount() > 0 &&
         selections.all((o) => isNode(o))),

    getResponse: ({ history, designer, selections }: CircuitInfo) => {
        const ports = selections.get().filter((o) => isNode(o)) as Node[];

        // Deselect the ports and then snip them
        history.add(new GroupAction([
            DeselectAll(selections),
            SnipGroup(designer, ports),
        ], "Snip Wire Ports Handler"));
    },
});
