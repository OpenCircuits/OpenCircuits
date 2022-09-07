import {V} from "Vector";

import {CircuitInfo} from "core/utils/CircuitInfo";
import {CopyGroup}   from "core/utils/ComponentUtils";
import {Event}       from "core/utils/Events";

import {GroupAction} from "core/actions/GroupAction";

import {CreateAddGroupAction} from "core/actions/addition/AddGroupAction";

import {CreateDeselectAllAction,
        CreateGroupSelectAction} from "core/actions/selection/SelectAction";

import {TranslateAction} from "core/actions/transform/TranslateAction";

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
            CreateAddGroupAction(designer, copies),
            CreateDeselectAllAction(selections).execute(),
            CreateGroupSelectAction(selections, components).execute(),
            new TranslateAction(components,
                                components.map((o) => o.getPos()),
                                components.map((o) => o.getPos().add(V(5, 5)))).execute(),
        ], "Duplicate Handler"));
    },
});
