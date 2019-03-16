import {LEFT_MOUSE_BUTTON,
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

        return (event == "keydown" && button === OPTION_KEY);
    }

    public deactivate(event: string, input: Input, button?: number): boolean {
        // Deactivate if stopped dragging by releasing mouse
        //  or if no dragging happened and OPTION_KEY was released
        return (event == "mouseup" ||
               !this.isDragging && event == "keyup" && button === OPTION_KEY);
    }

    public onMouseDrag(input: Input, button: number): boolean {
        if (button === LEFT_MOUSE_BUTTON) {

            this.isDragging = true;

            const dPos = input.getDeltaMousePos();
            this.camera.translate(dPos.scale(-1*this.camera.getZoom()));

            return true;
        }

        return false;
    }

}
