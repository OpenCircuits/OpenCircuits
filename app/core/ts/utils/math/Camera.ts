import {Vector,V} from "./Vector";
import {Transform} from "./Transform";
import {Matrix2x3} from "./Matrix";
import {TransformContains} from "./MathUtils";
import {serializable, serialize} from "serialeazy";

@serializable("Camera")
export class Camera {
    @serialize
    private pos: Vector;
    @serialize
    private zoom: number;

    private transform: Transform;

    private mat: Matrix2x3;
    private inv: Matrix2x3;

    @serialize
    private width: number;
    @serialize
    private height: number;

    private dirty: boolean;

    public constructor(width?: number, height?: number, startPos: Vector = V(0, 0), startZoom: number = 1) {
        this.width = width;
        this.height = height;
        this.pos = startPos;
        this.zoom = startZoom;
        this.transform = new Transform(V(0,0), V(0,0), 0);
        this.dirty = true;
    }
    private updateMatrix(): void {
        if (!this.dirty)
            return;
        this.dirty = false;

        this.mat = new Matrix2x3();
        this.mat.translate(this.pos);
        this.mat.scale(V(this.zoom, this.zoom));
        this.inv = this.mat.inverse();

        const p1 = this.getWorldPos(V(0, 0));
        const p2 = this.getWorldPos(V(this.width, this.height));
        this.transform.setPos(p2.add(p1).scale(0.5));
        this.transform.setSize(p2.sub(p1));
    }
    public resize(width: number, height: number): void {
        this.width = width;
        this.height = height;
    }
    public setPos(pos: Vector): void {
        this.dirty = true;
        this.pos = pos;
    }
    public setZoom(zoom: number): void{
        this.dirty = true;
        this.zoom = zoom;
    }
    public translate(dv: Vector): void {
        this.dirty = true;
        this.pos = this.pos.add(dv);
    }
    public zoomTo(c: Vector, z: number): void {
        // Calculate position to zoom in/out of
        const pos0 = this.getWorldPos(c);
        this.zoomBy(z);
        const pos1 = this.getScreenPos(pos0);
        const dPos = pos1.sub(c);
        this.translate(dPos.scale(this.getZoom()));
    }
    public zoomBy(s: number): void {
        this.dirty = true;
        this.zoom *= s;
    }
    public cull(transform: Transform): boolean {
        return TransformContains(transform, this.getTransform());
    }
    public getCenter(): Vector {
        return V(this.width/2, this.height/2);
    }
    public getPos(): Vector {
        return this.pos.copy();
    }
    public getZoom(): number {
        return this.zoom;
    }
    public getTransform(): Transform {
        this.updateMatrix();
        return this.transform.copy();
    }
    public getMatrix(): Matrix2x3 {
        this.updateMatrix();
        return this.mat.copy();
    }
    public getInverseMatrix(): Matrix2x3 {
        this.updateMatrix();
        return this.inv.copy();
    }
    public getScreenPos(v: Vector): Vector {
        return this.getInverseMatrix().mul(v).add(this.getCenter());
    }
    public getWorldPos(v: Vector): Vector {
        return this.getMatrix().mul(v.sub(this.getCenter()));
    }

}
