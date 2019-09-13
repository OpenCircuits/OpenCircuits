import {MIDDLE_MOUSE_BUTTON,
        OPTION_KEY} from "../Constants";
import {Tool} from "./Tool";
import {Input} from "../Input";
import {Camera} from "../Camera";

import {SelectionTool} from "./SelectionTool";

export class PanTool extends Tool {

    private camera: Camera;

    private isDragging: boolean;

    public constructor(camera: Camera) {
        super();

        this.camera = camera;
    }

    public activate(currentTool: Tool, event: string, input: Input, button?: number): boolean {
        if (!(currentTool instanceof SelectionTool))
            return false;

        this.isDragging = false;

        if (event == "keydown" && button === OPTION_KEY)
            return true;

        if (event == "mousedrag" && (button === MIDDLE_MOUSE_BUTTON ||
                                     input.getTouchCount() == 2)) {
            this.onMouseDrag(input); // Explicitly drag
            return true;
        }

        return false;
    }

    public deactivate(event: string, input: Input, button?: number): boolean {
        // Deactivate if stopped dragging by releasing mouse
        //  or if no dragging happened and OPTION_KEY was released
        return (event == "mouseup" ||
               !this.isDragging && event == "keyup" && button === OPTION_KEY);
    }

    public onMouseDrag(input: Input): boolean {
        this.isDragging = true;

        const dPos = input.getDeltaMousePos();
        this.camera.translate(dPos.scale(-1*this.camera.getZoom()));

        return true;
    }

}
