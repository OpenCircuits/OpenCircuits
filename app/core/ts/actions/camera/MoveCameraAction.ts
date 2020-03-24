import {Vector} from "Vector";
import {Camera} from "math/Camera";
import {Action} from "core/actions/Action";

export class MoveCameraAction implements Action {
    protected camera: Camera;

    protected initialPos: Vector;
    protected finalPos: Vector;

    protected initialZoom: number;
    protected finalZoom: number;

    public constructor(camera: Camera, finalPos: Vector, finalZoom: number) {
        this.camera = camera;

        this.initialPos = camera.getPos();
        this.finalPos = finalPos;

        this.initialZoom = camera.getZoom();
        this.finalZoom = finalZoom;
    }

    public execute(): Action {
        this.camera.setPos(this.finalPos);
        this.camera.setZoom(this.finalZoom);

        return this;
    }

    public undo(): Action {
        this.camera.setPos(this.initialPos);
        this.camera.setZoom(this.initialZoom);

        return this;
    }

}
