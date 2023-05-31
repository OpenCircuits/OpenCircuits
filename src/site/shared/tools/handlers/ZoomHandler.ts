import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


export const ZoomHandler: ToolHandler = {
    onEvent: (ev, { circuit }) => {
        if (ev.type !== "zoom")
            return ToolHandlerResponse.PASS;

        circuit.camera.zoomTo(ev.factor, ev.pos);

        // This should be the only handler to handle the zoom event
        return ToolHandlerResponse.HALT;
    },
}
