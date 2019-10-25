import {MIDDLE_MOUSE_BUTTON,
        OPTION_KEY} from "core/utils/Constants";
import {Camera} from "math/Camera";
import {Input} from "core/utils/Input";
import {Tool} from "core/tools/Tool";
import {Action} from "core/actions/Action";

import {SelectionTool} from "./SelectionTool";

export class PanTool extends Tool {
    private camera: Camera;

    private isDragging: boolean;

    public constructor(camera: Camera) {
        super();

        this.camera = camera;
    }

    public shouldActivate(currentTool: Tool, event: string, input: Input, button?: number): boolean {
        if (!(currentTool instanceof SelectionTool))
            return false;
        if (event == "keydown" && button === OPTION_KEY)
            return true;
        if (event == "mousedrag" && (button === MIDDLE_MOUSE_BUTTON ||
                                     input.getTouchCount() == 2))
            return true;
        return false;
    }

    public activate(_: Tool, event: string, input: Input): void {
        this.isDragging = false;

        if (event == "mousedrag")
            this.onMouseDrag(input); // Explicitly call drag event
    }

    public shouldDeactivate(event: string, _: Input, button?: number): boolean {
        // Deactivate if stopped dragging by releasing mouse
        //  or if no dragging happened and OPTION_KEY was released
        return (event == "mouseup" ||
               !this.isDragging && event == "keyup" && button === OPTION_KEY);
    }

    public deactivate(): Action {
        this.isDragging = false;

        return undefined;
    }

    public onMouseDrag(input: Input): boolean {
        this.isDragging = true;

        const dPos = input.getDeltaMousePos();
        this.camera.translate(dPos.scale(-1*this.camera.getZoom()));

        return true;
    }

}
