import {V, Vector} from "Vector";
import {Clamp}     from "math/MathUtils";
import {Matrix2x3} from "math/Matrix";
import {Margin}    from "math/Rect";

import {DirtyVar}  from "shared/api/circuit/utils/DirtyVar";
import {ObservableImpl} from "shared/api/circuit/utils/Observable";
import {CircuitTypes} from "shared/api/circuit/public/impl/CircuitState";


import {Camera, CameraEvent} from "../Camera";
import {Viewport} from "../Viewport";
import {CircuitDesignerState} from "./CircuitDesignerState";


export const MIN_ZOOM = 1e-6;
export const MAX_ZOOM = 200;

export class CameraImpl<T extends CircuitTypes> extends ObservableImpl<CameraEvent> implements Camera {
    protected readonly state: CircuitDesignerState<T>;
    protected readonly view: Viewport;

    protected readonly mat: DirtyVar<Matrix2x3>;

    public constructor(state: CircuitDesignerState<T>, view: Viewport) {
        super();

        this.state = state;
        this.view = view;
        this.mat = new DirtyVar<Matrix2x3>(() => {
            const { x, y, zoom } = this.internal.getCamera();

            const screenSize = view.canvasInfo?.screenSize ?? V(0, 0);
            return new Matrix2x3(
                V(x - screenSize.x/2 * zoom, y - screenSize.y/2 * -zoom),
                0,
                V(zoom, -zoom)
            );
        });

        // Need to be careful with this kind of subscription model
        // It could be a memory leak if Camera instances are created and disposed of
        // since we can't know when to unsubscribe since we there are no destructors in JS
        // So we should make sure the camera is only created once per-key and deleted if the IC or whatever is deleted
        view.subscribe("onresize", (_) => {
            this.mat.setDirty();
        });
    }

    protected get internal() {
        return this.state.circuitState.internal;
    }

    public get matrix(): Matrix2x3 {
        return this.mat.get();
    }

    public set cx(x: number) {
        const cam = this.internal.getCamera();
        const dx = (cam.x - x);

        // No change, do nothing
        if (dx === 0)
            return;

        this.internal.setCamera({ x });
        this.publish({ type: "change", dx, dy: 0, dz: 0 });
        this.mat.setDirty();
    }
    public get cx(): number {
        return this.internal.getCamera().x;
    }
    public set cy(y: number) {
        const cam = this.internal.getCamera();
        const dy = (cam.y - y);

        // No change, do nothing
        if (dy === 0)
            return;

        this.internal.setCamera({ y });
        this.publish({ type: "change", dx: 0, dy, dz: 0 });
        this.mat.setDirty();
    }
    public get cy(): number {
        return this.internal.getCamera().y;
    }
    public set pos({ x, y }: Vector) {
        const cam = this.internal.getCamera();
        const dx = (cam.x - x), dy = (cam.y - y);

        // No change, do nothing
        if (dx === 0 && dy === 0)
            return;

        this.internal.setCamera({ x, y });
        this.publish({ type: "change", dx, dy, dz: 0 });
        this.mat.setDirty();
    }
    public get pos(): Vector {
        const camera = this.internal.getCamera();

        return V(camera.x, camera.y);
    }

    public set zoom(zoom: number) {
        const cam = this.internal.getCamera();
        const dz = (cam.zoom - zoom);

        // No change, do nothing
        if (dz === 0)
            return;

        this.internal.setCamera({ zoom });
        this.publish({ type: "change", dx: 0, dy: 0, dz: dz });
        this.mat.setDirty();
    }
    public get zoom(): number {
        return this.internal.getCamera().zoom;
    }

    public translate(delta: Vector, space: Vector.Spaces = "world"): void {
        if (space === "screen")
            return this.translate(V(delta.x * this.zoom, -delta.y * this.zoom));
        this.pos = this.pos.add(delta);
    }
    public zoomTo(zoom: number, pos: Vector): void {
        const pos0 = this.toWorldPos(pos);
        this.zoom = Clamp(this.zoom * zoom, MIN_ZOOM, MAX_ZOOM);
        this.translate(this.toScreenPos(pos0).sub(pos), "screen");
    }

    public toWorldPos(screenPos: Vector): Vector {
        return this.mat.get().mul(screenPos);
    }
    public toScreenPos(worldPos: Vector): Vector {
        return this.mat.get().inverse().mul(worldPos);
    }

    public zoomToFit(_objs: T["Obj[]"], _margin?: Margin, _padRatio?: number): void {
        throw new Error("Camera.zoomToFit: Unimplemented!");
    }
}
