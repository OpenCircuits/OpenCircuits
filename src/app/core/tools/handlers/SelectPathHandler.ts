import {LEFT_MOUSE_BUTTON} from "core/utils/Constants";

import {Event} from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";
import {GetComponentPath, GetWirePath} from "core/utils/ComponentUtils";

import {CreateGroupSelectAction} from "core/actions/selection/SelectAction";

import {EventHandler} from "../EventHandler";

import {Component, Wire} from "core/models";

export const SelectPathHandler: EventHandler = ({
    conditions: (event: Event, {input, camera, designer}: CircuitInfo) =>
        (event.type === "dblclick" &&
         event.button === LEFT_MOUSE_BUTTON &&
         designer // is there a wire or component within select bounds?
           .getAll()
           .find(o =>
               o.isWithinSelectBounds(camera.getWorldPos(input.getMousePos())))
           !== undefined
        ),

    getResponse: ({input, camera, history, designer, selections}: CircuitInfo) => {
        const worldMousePos = camera.getWorldPos(input.getMousePos());

        const obj = designer
            .getAll()
            .reverse()
            .find(o =>
                o.isWithinSelectBounds(worldMousePos)) as Component | Wire;

        const path = (obj instanceof Wire) ? (GetWirePath(obj)) : (GetComponentPath(obj!));
        history.add(CreateGroupSelectAction(selections, path).execute());
    }
});
