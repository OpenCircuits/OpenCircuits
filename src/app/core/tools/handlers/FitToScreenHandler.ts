import {CircuitInfo}       from "core/utils/CircuitInfo";
import {InputManagerEvent} from "core/utils/InputManager";

import {EventHandler} from "../EventHandler";


const FIT_PADDING_RATIO = 1.2;

export const FitToScreenHandler: EventHandler = ({
    conditions: (event: InputManagerEvent, {}: CircuitInfo) =>
        (event.type === "keyup" && event.key === "f"),

    getResponse: ({ camera, circuit, history, selections }: CircuitInfo) => {
        // @TODO
        // // Fit to selections, if any;
        // //  otherwise fit all CullableObjects
        // const objs = (selections.amount() === 0 ?
        //     designer.getAll() :
        //     selections.get().filter((o) => o instanceof CullableObject)) as CullableObject[];

        // // Get final camera position and zoom
        // const [pos, zoom] = GetCameraFit(camera, objs, FIT_PADDING_RATIO);
        // history.add(new GroupAction([
        //     SetProperty(camera, "pos", pos),
        //     SetProperty(camera, "zoom", zoom),
        // ], "Fit to Screen"));
    },
});
