import {V, Vector} from "Vector";
import {Clamp}     from "math/MathUtils";
import {Margin}    from "math/Rect";

import {Camera}                     from "../Camera";
import {CircuitState, CircuitTypes} from "./CircuitState";


export function CameraImpl<T extends CircuitTypes>({ internal, view }: CircuitState<T>) {
    function camera() {
        return internal.getCamera();
    }

    return {
        set cx(x: number) {
            internal.setCameraProps({ x });
        },
        get cx(): number {
            return camera().x;
        },
        set cy(y: number) {
            internal.setCameraProps({ y });
        },
        get cy(): number {
            return camera().y;
        },
        set pos({ x, y }: Vector) {
            internal.setCameraProps({ x, y });
        },
        get pos(): Vector {
            return V(this.cx, this.cy);
        },

        set zoom(zoom: number) {
            internal.setCameraProps({ zoom });
        },
        get zoom(): number {
            return camera().zoom;
        },

        translate(delta: Vector, space: Vector.Spaces = "world"): void {
            if (space === "screen")
                return this.translate(V(delta.x * this.zoom, -delta.y * this.zoom));
            this.pos = this.pos.add(delta);
        },
        zoomTo(zoom: number, pos: Vector): void {
            const pos0 = view.toWorldPos(pos);
            this.zoom = Clamp(this.zoom * zoom, 1e-6, 200);
            this.translate(view.toScreenPos(pos0).sub(pos), "screen");
        },

        toWorldPos(screenPos: Vector): Vector {
            return view.toWorldPos(screenPos);
        },

        zoomToFit(objs: T["Obj[]"], margin?: Margin, padRatio?: number): void {
            throw new Error("Unimplemented!");
        },
    } satisfies Camera;
}
