import {D_KEY} from "core/utils/Constants";
import {V} from "Vector";

import {Event} from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";

import {GroupAction} from "core/actions/GroupAction";
import {TranslateAction} from "core/actions/transform/TranslateAction";
import {CreateDeselectAllAction,
        CreateGroupSelectAction} from "core/actions/selection/SelectAction";
import {CopyGroupAction} from "core/actions/CopyGroupAction";

import {IOObject} from "core/models";

import {EventHandler} from "../EventHandler";


export const DuplicateHandler: EventHandler = ({
    conditions: (event: Event, {input, selections}: CircuitInfo) =>
        (event.type === "keydown" &&
         event.key === D_KEY &&
         input.isModifierKeyDown() &&
         selections.amount() > 0),

    getResponse: ({history, designer, selections}: CircuitInfo) => {
        const objs = selections.get().filter(o => o instanceof IOObject) as IOObject[];

        const copyGroupAction = new CopyGroupAction(designer, objs);
        const components = copyGroupAction.getCopies().getComponents();

        // Copy the group and then select them and move them over slightly
        history.add(new GroupAction([
            copyGroupAction.execute(),
            CreateDeselectAllAction(selections).execute(),
            CreateGroupSelectAction(selections, components).execute(),
            new TranslateAction(components,
                                components.map(o => o.getPos()),
                                components.map(o => o.getPos().add(V(5, 5)))).execute()
        ]));
    }
});
