import {V, Vector} from "Vector";
import {Clamp}     from "math/MathUtils";
import {Rect}      from "math/Rect";

import {Camera}       from "../Camera";
import {CircuitState} from "./CircuitState";
import {Obj}          from "../Obj";


export class CameraImpl implements Camera {
    protected state: CircuitState;

    public constructor(state: CircuitState) {
        this.state = state;
    }

    protected get circuit() {
        return this.state.circuit;
    }
    protected get camera() {
        return this.circuit.getCamera();
    }

    public set cx(x: number) {
        this.circuit.setCameraProps({ x });
    }
    public get cx(): number {
        return this.camera.x;
    }

    public set cy(y: number) {
        this.circuit.setCameraProps({ y });
    }
    public get cy(): number {
        return this.camera.y;
    }

    public set pos({ x, y }: Vector) {
        this.circuit.setCameraProps({ x, y });
    }
    public get pos(): Vector {
        return V(this.cx, this.cy);
    }

    public set zoom(zoom: number) {
        this.circuit.setCameraProps({ zoom });
    }
    public get zoom(): number {
        return this.camera.zoom;
    }

    public set margin(m: Rect) {
        throw new Error("Method not implemented.");
    }
    public get margin(): Rect {
        throw new Error("Method not implemented.");
    }

    public translate(delta: Vector, space: Vector.Spaces = "world"): void {
        if (space === "screen")
            return this.translate(V(delta.x * this.zoom, -delta.y * this.zoom));
        this.pos = this.pos.add(delta);
    }

    public zoomTo(zoom: number, pos: Vector): void {
        const view = this.state.view!;

        const pos0 = view.toWorldPos(pos);
        this.zoom = Clamp(this.zoom * zoom, 1e-6, 200);
        this.translate(view.toScreenPos(pos0).sub(pos), "screen");
    }

    public toWorldPos(screenPos: Vector): Vector {
        return this.state.view!.toWorldPos(screenPos);
    }

    public zoomToFit(objs: Obj[]): void {
        throw new Error("Unimplemented!");
    }
}
