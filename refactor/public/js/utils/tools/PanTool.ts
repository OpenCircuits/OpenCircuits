import {LEFT_MOUSE_BUTTON,
        OPTION_KEY,
        SHIFT_KEY} from "../Constants";
import {Tool} from "./Tool";
import {Input} from "../Input";
import {Camera} from "../Camera";

export class PanTool extends Tool {

    private camera: Camera;

    public constructor(camera: Camera) {
        super();

        this.camera = camera;
    }

    public onMouseDrag(input: Input, button: number): boolean {
        if (button === LEFT_MOUSE_BUTTON) {

            var dPos = input.getDeltaMousePos();
            this.camera.translate(dPos.scale(-1*this.camera.getZoom()));

            return true;
        }

        return false;
    }

}
