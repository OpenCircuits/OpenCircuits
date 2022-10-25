import {LEFT_MOUSE_BUTTON} from "core/utils/Constants";

import {CircuitInfo}       from "core/utils/CircuitInfo";
import {InputManagerEvent} from "core/utils/InputManager";

import {EventHandler} from "../EventHandler";


export const SelectPathHandler: EventHandler = ({
    conditions: (event: InputManagerEvent, { input, camera, circuit }: CircuitInfo) =>
        (event.type === "dblclick" &&
         event.button === LEFT_MOUSE_BUTTON),
        // @TODO
        //  designer // is there a wire or component within select bounds?
        //    .getAll()
        //    .some((o) => o.isWithinSelectBounds(camera.getWorldPos(input.getMousePos())))
        // ),

    getResponse: ({ input, camera, circuit, history, selections }: CircuitInfo) => {
        // @TODO
        // const worldMousePos = camera.getWorldPos(input.getMousePos());

        // const obj = designer
        //     .getAll()
        //     .reverse()
        //     .find((o) =>
        //         o.isWithinSelectBounds(worldMousePos)) as Component | Wire;

        // const path = (obj instanceof Wire) ? (GetPath(obj)) : (GetComponentPath(obj!));
        // history.add(SelectGroup(selections, path));
    },
});
