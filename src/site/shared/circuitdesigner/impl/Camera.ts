import {V, Vector} from "Vector";
import {Clamp}     from "math/MathUtils";
import {Margin}    from "math/Rect";
import {DirtyVar}  from "core/utils/DirtyVar";

import {extend} from "core/utils/Functions";

import {Camera, CameraEvent}        from "../Camera";
import {CircuitState, CircuitTypes} from "core/public/CircuitState";
import {ObservableImpl}             from "core/public/api/impl/Observable";
import {Viewport} from "../Viewport";
import {CameraRecordKey, CircuitDesignerState} from "./CircuitDesignerState";
import {Matrix2x3} from "math/Matrix";


export const MIN_ZOOM = 1e-6;
export const MAX_ZOOM = 200;


export function CameraImpl<T extends CircuitTypes>(key: CameraRecordKey, state: CircuitDesignerState<T>) {
    const observable = ObservableImpl<CameraEvent>();

    const mat = new DirtyVar<Matrix2x3>(() => {
        const { x, y, zoom } = state.cameras[key];

        return new Matrix2x3(V(x, y), 0, V(zoom, -zoom));
    });

    // // Need to be careful with this kind of subscription model
    // // It could be a memory leak if Camera instances are created and disposed of
    // // since we can't know when to unsubscribe since we there are no destructors in JS
    // viewport.observe("oncamerachange", (ev) => {
    //     observable.emit({ type: "change", ...ev });
    // });

    return extend(observable, {
        set cx(x: number) {
            state.cameras[key].x = x;

            mat.setDirty();
        },
        get cx(): number {
            return state.cameras[key].x;
        },
        set cy(y: number) {
            state.cameras[key].y = y;

            mat.setDirty();
        },
        get cy(): number {
            return state.cameras[key].y;
        },
        set pos({ x, y }: Vector) {
            const camera = state.cameras[key];

            camera.x = x;
            camera.y = y;

            mat.setDirty();
        },
        get pos(): Vector {
            const camera = state.cameras[key];

            return V(camera.x, camera.y);
        },

        set zoom(zoom: number) {
            state.cameras[key].zoom = zoom;

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
            return mat.get().mul(screenPos.sub(state.renderer.screenSize.scale(0.5)));
        },
        toScreenPos(worldPos: Vector): Vector {
            return mat.get().inverse().mul(worldPos).add(state.renderer.screenSize.scale(0.5));
        },

        zoomToFit(objs: T["Obj[]"], margin?: Margin, padRatio?: number): void {
            throw new Error("Unimplemented!");
        },
    }) satisfies Camera;
}
