import {CircuitDesigner}   from "shared/api/circuitdesigner/public/CircuitDesigner";
import {InputAdapterEvent} from "shared/src/utils/input/InputAdapterEvent";


export enum ToolHandlerResponse {
    /** This response represents that the handler is okay with subsequent handlers executing in this event cycle. */
    PASS = 0,
    /** This response represents that the handler does not want subsequent handlers executing in this event cycle. */
    HALT = 1,
}

export interface ToolHandler {
    /**
     * This method will run when an event occurs and a previous handler
     *  has not sent a "HALT" response.
     * i.e. If the user zooms and the ZoomHandler catches it, it will return "HALT"
     *  and then any other handlers after it will not be called for this event.
     *
     * @param ev       The input event that just fired.
     * @param designer The circuit designer that this hander acts on.
     * @returns        A handler response. Return PASS if nothing was done or you want
     *                 other handlers to potentially handle the event as well. Return HALT if
     *                 this should be the only handler to handle the event.
     */
    onEvent: (ev: InputAdapterEvent, designer: CircuitDesigner) => ToolHandlerResponse;
}
