import {Circuit}           from "core/public";
import {InputManagerEvent} from "shared/utils/input/InputManagerEvent";


export enum ToolHandlerResponse {
    PASSTHROUGH = 0,
    STOP = 1,
}

export interface ToolHandler {
    /**
     * This method will run when an event occurs and a previous handler
     *  has not sent a "STOP" response.
     * i.e. If the user zooms and the ZoomHandler catches it, it will return "STOP"
     *  and then any other handlers after it will not be called for this event.
     *
     * @param ev      The input event that just fired.
     * @param circuit The circuit that this hander acts on.
     * @returns       A handler response. Return PASSTHROUGH if nothing was done or you want
     *                other handlers to potentially handle the event as well. Return STOP if
     *                this should be the only handler to handle the event.
     */
    onEvent: (ev: InputManagerEvent, circuit: Circuit) => ToolHandlerResponse;
}
