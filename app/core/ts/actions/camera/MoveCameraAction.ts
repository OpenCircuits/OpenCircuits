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

    // Static method conveniently creates a MoveCameraAction after the
    // camera is moved (the constructor is for before the camera is moved)
    public static postMoveCameraAction(camera: Camera, initialPos: Vector, initialZoom: number): MoveCameraAction {
        const action = new MoveCameraAction(camera, camera.getPos(), camera.getZoom());
        action.initialPos = initialPos;
        action.initialZoom = initialZoom;

        return action;
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
