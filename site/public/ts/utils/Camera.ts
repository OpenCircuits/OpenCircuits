import {Vector,V} from "./math/Vector";
import {Transform} from "./math/Transform";
import {Matrix2x3} from "./math/Matrix";
import {TransformContains} from "./math/MathUtils";

export class Camera {
    private pos: Vector;
    private zoom: number;

    private center: Vector;
    private transform: Transform;

    private mat: Matrix2x3;
    private inv: Matrix2x3;

    private width: number;
    private height: number;

    private dirty: boolean;

    public constructor(width: number, height: number, startPos: Vector = V(0, 0), startZoom: number = 1) {
        this.width = width;
        this.height = height;
        this.pos = startPos;
        this.zoom = startZoom;
        this.center = V(width,height).scale(0.5);
        this.transform = new Transform(V(0,0), V(0,0), 0);
        this.dirty = true;
    }
    public resize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.center = V(this.width, this.height).scale(0.5);
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
    public translate(dx: Vector | number, dy: number = 0): void {
        this.dirty = true;
        this.pos.translate(dx, dy);
    }
    public zoomBy(s: number): void {
        this.dirty = true;
        this.zoom *= s;
    }
    public cull(transform: Transform): boolean {
        // getCurrentContext().getRenderer().save();
        // transform.transformCtx(getCurrentContext().getRenderer().context);
        // getCurrentContext().getRenderer().rect(0, 0, transform.size.x, transform.size.y, '#ff00ff');
        // getCurrentContext().getRenderer().restore();

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
        return this.getInverseMatrix().mul(v).add(this.center);
    }
    public getWorldPos(v: Vector): Vector {
        return this.getMatrix().mul(v.sub(this.center));
    }
}
