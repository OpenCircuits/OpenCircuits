import {CircuitInfo}       from "core/utils/CircuitInfo";
import {CalcWorldMousePos} from "core/utils/CircuitInfoUtils";
import {Event}             from "core/utils/Events";

import {EventHandler} from "core/tools/EventHandler";

import {AnyComponent} from "core/models/types";

import {CircuitController}      from "core/controllers/CircuitController";
import {PressableComponentView} from "core/views/PressableComponentView";


// Handler to deal with pressing/clicking/releasing
//  of pressable objects
// Right now this is just Switchs and Buttons
export const PressableHandler: EventHandler = ({
    conditions: (event: Event, info: CircuitInfo) => {
        if (!(event.type === "mousedown"
            || event.type === "mouseup"
            || event.type === "click"
        )) {
            return false;
        }
        const { viewManager } = info;
        // See if we're hovering over an object
        const pos = CalcWorldMousePos(info);
        const obj = viewManager.findNearestObj(pos);
        if (!obj)
            return false;
        const view = viewManager.getView(obj.id);
        if (!(view instanceof PressableComponentView))
            return false;
        return (view.isWithinPressBounds(pos))
    },

    getResponse: (info: CircuitInfo, event: Event) => {
        const { viewManager } = info;

        const pos = CalcWorldMousePos(info);
        const view = viewManager.getView(viewManager.findNearestObj(pos)!.id) as PressableComponentView<AnyComponent>;

        switch (event.type) {
            case "mousedown":
                // TODO button
                break;
            case "mouseup":
                // TODO button
                break;
            case "click":
                view.onClick();
                break;
        }
    },
});
