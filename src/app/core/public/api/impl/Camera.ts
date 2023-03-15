import {V, Vector} from "Vector";
import {Clamp}     from "math/MathUtils";
import {Rect}      from "math/Rect";

import {Camera}       from "../Camera";
import {CircuitState} from "./CircuitState";


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

    public translate(dPos: Vector, space: Vector.Spaces = "world"): void {
        if (space === "screen")
            return this.translate(V(dPos.x * this.zoom, -dPos.y * this.zoom));
        this.pos = this.pos.add(dPos);
    }

    public zoomTo(zoom: number, pos: Vector): void {
        const view = this.state.view!;

        const pos0 = view.toWorldPos(pos);
        this.zoom = Clamp(this.zoom * zoom, 1e-6, 200);
        const dPos = view.toScreenPos(pos0).sub(pos);
        this.translate(V(dPos.x, dPos.y), "screen");
    }

    public toWorldPos(pos: Vector): Vector {
        return this.state.view!.toWorldPos(pos);
    }
}
