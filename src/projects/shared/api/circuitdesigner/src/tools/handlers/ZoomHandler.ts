import {ToolHandler, ToolHandlerResponse} from "./ToolHandler";


export const ZoomHandler: ToolHandler = {
    name: "ZoomHandler",

    canActivateWhenLocked: true,

    onEvent: (ev, { viewport }) => {
        if (ev.type !== "zoom")
            return ToolHandlerResponse.PASS;

        viewport.camera.zoomTo(ev.factor, viewport.toWorldPos(ev.pos));

        // This should be the only handler to handle the zoom event
        return ToolHandlerResponse.HALT;
    },
}
