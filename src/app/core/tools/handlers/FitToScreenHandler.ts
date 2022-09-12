import {CircuitInfo}  from "core/utils/CircuitInfo";
import {GetCameraFit} from "core/utils/ComponentUtils";
import {Event}        from "core/utils/Events";

import {GroupAction} from "core/actions/GroupAction";

import {SetProperty} from "core/actions/units/SetProperty";

import {CullableObject} from "core/models";

import {EventHandler} from "../EventHandler";


const FIT_PADDING_RATIO = 1.2;

export const FitToScreenHandler: EventHandler = ({
    conditions: (event: Event, {}: CircuitInfo) =>
        (event.type === "keyup" && event.key === "f"),

    getResponse: ({ camera, history, designer, selections }: CircuitInfo) => {
        // Fit to selections, if any;
        //  otherwise fit all CullableObjects
        const objs = (selections.amount() === 0 ?
            designer.getAll() :
            selections.get().filter((o) => o instanceof CullableObject)) as CullableObject[];

        // Get final camera position and zoom
        const [pos, zoom] = GetCameraFit(camera, objs, FIT_PADDING_RATIO);
        history.add(new GroupAction([
            SetProperty(camera, "pos", pos),
            SetProperty(camera, "zoom", zoom),
        ], "Fit to Screen"));
    },
});
