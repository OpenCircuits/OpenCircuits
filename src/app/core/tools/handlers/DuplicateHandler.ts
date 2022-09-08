import {V} from "Vector";

import {CircuitInfo} from "core/utils/CircuitInfo";
import {CopyGroup}   from "core/utils/ComponentUtils";
import {Event}       from "core/utils/Events";

import {GroupAction} from "core/actions/GroupAction";

import {AddGroup} from "core/actions/compositions/AddGroup";

import {DeselectAll, SelectGroup} from "core/actions/units/Select";
import {Translate}                from "core/actions/units/Translate";

import {IOObject} from "core/models";

import {EventHandler} from "../EventHandler";


export const DuplicateHandler: EventHandler = ({
    conditions: (event: Event, { input, selections }: CircuitInfo) =>
        (event.type === "keydown" &&
         event.key === "d" &&
         input.isModifierKeyDown() &&
         selections.amount() > 0),

    getResponse: ({ history, designer, selections }: CircuitInfo) => {
        const objs = selections.get().filter((o) => o instanceof IOObject) as IOObject[];

        const copies = CopyGroup(objs);
        const components = copies.getComponents();

        // Copy the group and then select them and move them over slightly
        history.add(new GroupAction([
            AddGroup(designer, copies),
            DeselectAll(selections),
            SelectGroup(selections, components),
            Translate(components, components.map((o) => o.getPos().add(V(5, 5)))),
        ], "Duplicate Handler"));
    },
});
