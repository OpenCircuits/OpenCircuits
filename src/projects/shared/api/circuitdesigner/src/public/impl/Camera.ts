import {V, Vector} from "Vector";
import {Clamp}     from "math/MathUtils";
import {Margin}    from "math/Rect";
import {DirtyVar}  from "shared/api/circuit/utils/DirtyVar";

import {extend} from "shared/api/circuit/utils/Functions";

import {Camera, CameraEvent}        from "../Camera";
import {CircuitTypes} from "shared/api/circuit/public/impl/CircuitState";
import {ObservableImpl}             from "shared/api/circuit/public/impl/Observable";
import {Viewport} from "../Viewport";
import {CameraRecordKey, CircuitDesignerState} from "./CircuitDesignerState";
import {Matrix2x3} from "math/Matrix";


export const MIN_ZOOM = 1e-6;
export const MAX_ZOOM = 200;


export function CameraImpl<T extends CircuitTypes>(
    key: CameraRecordKey,
    state: CircuitDesignerState<T>,
    view: Viewport,
) {
    const observable = ObservableImpl<CameraEvent>();

    const mat = new DirtyVar<Matrix2x3>(() => {
        const { x, y, zoom } = state.cameras[key];

        return new Matrix2x3(
            V(x - view.screenSize.x/2 * zoom, y - view.screenSize.y/2 * -zoom),
            0,
            V(zoom, -zoom)
        );
    });

    // Need to be careful with this kind of subscription model
    // It could be a memory leak if Camera instances are created and disposed of
    // since we can't know when to unsubscribe since we there are no destructors in JS
    // So we should make sure the camera is only created once per-key and deleted if the IC or whatever is deleted
    view.observe("onresize", (_) => {
        mat.setDirty();
    });

    const camera = extend(observable, {
        get matrix(): Matrix2x3 {
            return mat.get();
        },

        set cx(x: number) {
            const cam = state.cameras[key];
            const dx = (cam.x - x);

            // No change, do nothing
            if (dx === 0)
                return;

            cam.x = x;
            camera.emit({ type: "change", dx, dy: 0, dz: 0 });
            mat.setDirty();
        },
        get cx(): number {
            return state.cameras[key].x;
        },
        set cy(y: number) {
            const cam = state.cameras[key];
            const dy = (cam.y - y);

            // No change, do nothing
            if (dy === 0)
                return;

            cam.y = y;
            camera.emit({ type: "change", dx: 0, dy, dz: 0 });
            mat.setDirty();
        },
        get cy(): number {
            return state.cameras[key].y;
        },
        set pos({ x, y }: Vector) {
            const cam = state.cameras[key];
            const dx = (cam.x - x), dy = (cam.y - y);

            // No change, do nothing
            if (dx === 0 && dy === 0)
                return;

            cam.x = x;
            cam.y = y;
            camera.emit({ type: "change", dx, dy, dz: 0 });
            mat.setDirty();
        },
        get pos(): Vector {
            const camera = state.cameras[key];

            return V(camera.x, camera.y);
        },

        set zoom(zoom: number) {
            const cam = state.cameras[key];
            const dz = (cam.zoom - zoom);

            // No change, do nothing
            if (dz === 0)
                return;

            cam.zoom = zoom;
            camera.emit({ type: "change", dx: 0, dy: 0, dz: dz });
            mat.setDirty();
        },
        get zoom(): number {
            return state.cameras[key].zoom;
        },

        translate(delta: Vector, space: Vector.Spaces = "world"): void {
            if (space === "screen")
                return this.translate(V(delta.x * this.zoom, -delta.y * this.zoom));
            this.pos = this.pos.add(delta);
        },
        zoomTo(zoom: number, pos: Vector): void {
            const pos0 = this.toWorldPos(pos);
            this.zoom = Clamp(this.zoom * zoom, MIN_ZOOM, MAX_ZOOM);
            this.translate(this.toScreenPos(pos0).sub(pos), "screen");
        },

        toWorldPos(screenPos: Vector): Vector {
            return mat.get().mul(screenPos);
        },
        toScreenPos(worldPos: Vector): Vector {
            return mat.get().inverse().mul(worldPos);
        },

        zoomToFit(objs: T["Obj[]"], margin?: Margin, padRatio?: number): void {
            throw new Error("Camera.zoomToFit: Unimplemented!");
        },
    }) satisfies Camera;

    return camera;
}
