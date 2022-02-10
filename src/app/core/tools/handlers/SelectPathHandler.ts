import {LEFT_MOUSE_BUTTON} from "core/utils/Constants";

import {Event} from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";
import {GetComponentPath, GetWirePath} from "core/utils/ComponentUtils";

import {CreateGroupSelectAction} from "core/actions/selection/SelectAction";

import {EventHandler} from "../EventHandler";


export const SelectPathHandler: EventHandler = ({
    conditions: (event: Event, {input, camera, designer}: CircuitInfo) =>
        (event.type === "dblclick" &&
         event.button === LEFT_MOUSE_BUTTON &&
         ( // is there a wire or component within select bounds?
          designer
            .getWires()
            .find(o =>
                o.isWithinSelectBounds(camera.getWorldPos(input.getMousePos())))
            !== undefined ||
          designer
            .getObjects()
            .find(o =>
                o.isWithinSelectBounds(camera.getWorldPos(input.getMousePos())))
            !== undefined
         )
        ),

    getResponse: ({input, camera, history, designer, selections}: CircuitInfo) => {
        const worldMousePos = camera.getWorldPos(input.getMousePos());

        const wire = designer
            .getWires()
            .reverse()
            .find(o => o.isWithinSelectBounds(worldMousePos));
        const component = designer
            .getObjects()
            .reverse()
            .find(o => o.isWithinSelectBounds(worldMousePos));

        if (wire != null) {
            const wirePath = GetWirePath(wire!);
            history.add(CreateGroupSelectAction(selections, wirePath).execute());
        } else {
            const objPath = GetComponentPath(component!);
            history.add(CreateGroupSelectAction(selections, objPath).execute())
        }
    }
});
