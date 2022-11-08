import {CircuitInfo}       from "core/utils/CircuitInfo";
import {InputManagerEvent} from "core/utils/InputManager";

import {EventHandler} from "../EventHandler";


export const DuplicateHandler: EventHandler = ({
    conditions: (event: InputManagerEvent, { input, selections }: CircuitInfo) =>
        (event.type === "keydown" &&
         event.key === "d" &&
         input.isModifierKeyDown() &&
         selections.amount() > 0),

    getResponse: ({ history, circuit, selections }: CircuitInfo) => {
        // @TODO
        // const objs = selections.get().filter((o) => o instanceof IOObject) as IOObject[];

        // const copies = CopyGroup(objs);
        // const components = copies.getComponents();

        // // Copy the group and then select them and move them over slightly
        // history.add(new GroupAction([
        //     AddGroup(designer, copies),
        //     DeselectAll(selections),
        //     SelectGroup(selections, components),
        //     Translate(components, components.map((o) => o.getPos().add(V(5, 5)))),
        // ], "Duplicate Handler"));
    },
});
