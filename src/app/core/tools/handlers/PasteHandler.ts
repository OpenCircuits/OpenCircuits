import {V_KEY} from "core/utils/Constants";
import {V} from "Vector";

import {Event} from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";

import {GroupAction} from "core/actions/GroupAction";
import {TranslateAction} from "core/actions/transform/TranslateAction";
import {CreateDeselectAllAction,
        CreateGroupSelectAction} from "core/actions/selection/SelectAction";
import {CopyGroupAction} from "core/actions/CopyGroupAction";

import {EventHandler} from "../EventHandler";


export const PasteHandler: EventHandler = ({
    conditions: (event: Event, {input, clipboard}: CircuitInfo) =>
        (event.type === "keydown" &&
         event.key === V_KEY &&
         input.isModifierKeyDown() &&
         clipboard.length > 0),

    getResponse: ({history, designer, selections, clipboard}: CircuitInfo) => {
        const copyGroupAction = new CopyGroupAction(designer, clipboard);
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
