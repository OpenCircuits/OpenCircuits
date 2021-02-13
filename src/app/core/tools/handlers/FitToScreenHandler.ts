import {FIT_PADDING_RATIO, F_KEY} from "core/utils/Constants";

import {Event} from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";
import {GetCameraFit} from "core/utils/ComponentUtils";

import {MoveCameraAction} from "core/actions/camera/MoveCameraAction";

import {CullableObject} from "core/models";

import {EventHandler} from "../EventHandler";


export const FitToScreenHandler: EventHandler = ({
    conditions: (event: Event, {}: CircuitInfo) =>
        (event.type === "keydown" && event.key === F_KEY),

    getResponse: ({camera, history, designer, selections}: CircuitInfo) => {
        // Fit to selections, if any;
        //  otherwise fit all CullableObjects
        const objs = (selections.amount() === 0 ?
            designer.getAll() :
            selections.get().filter(o => o instanceof CullableObject)) as CullableObject[];

        // Get final camera position and zoom
        const [pos, zoom] = GetCameraFit(camera, objs, FIT_PADDING_RATIO);
        history.add(new MoveCameraAction(camera, pos, zoom).execute());
    }
});
