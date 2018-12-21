import {Vector,V} from "./math/Vector";
import {Transform} from "./math/Transform";
import {Matrix2x3} from "./math/Matrix";
import {TransformContains} from "./math/MathUtils";

export class Camera {
    pos: Vector;
    zoom: number;

    center: Vector;
    transform: Transform;

    mat: Matrix2x3;
    inv: Matrix2x3;

    width: number;
    height: number;

    dirty: boolean;

    constructor(width: number, height: number, startPos: Vector = V(0, 0), startZoom: number = 1) {
        this.width = width;
        this.height = height;
        this.pos = startPos;
        this.zoom = startZoom;
        this.center = V(0,0);
        this.transform = new Transform(V(0,0), V(0,0), 0);
        this.dirty = true;
    }
    resize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.center = V(this.width, this.height).scale(0.5);
    }
    updateMatrix(): void {
        if (!this.dirty)
            return;
        this.dirty = false;

        this.mat = new Matrix2x3();
        this.mat.translate(this.pos);
        this.mat.scale(V(this.zoom, this.zoom));
        this.inv = this.mat.inverse();

        var p1 = this.getWorldPos(V(0, 0));
        var p2 = this.getWorldPos(V(this.width, this.height));
        this.transform.setPos(p2.add(p1).scale(0.5));
        this.transform.setSize(p2.sub(p1));
    }
    translate(dx: number, dy: number): void {
        this.dirty = true;
        this.pos.x += dx;
        this.pos.y += dy;
    }
    zoomBy(s: number): void {
        this.dirty = true;
        this.zoom *= s;
    }
    cull(transform: Transform): boolean {
        // getCurrentContext().getRenderer().save();
        // transform.transformCtx(getCurrentContext().getRenderer().context);
        // getCurrentContext().getRenderer().rect(0, 0, transform.size.x, transform.size.y, '#ff00ff');
        // getCurrentContext().getRenderer().restore();

        return TransformContains(transform, this.getTransform());
    }
    getTransform(): Transform {
        this.updateMatrix();
        return this.transform;
    }
    getMatrix(): Matrix2x3 {
        this.updateMatrix();
        return this.mat;
    }
    getInverseMatrix(): Matrix2x3 {
        this.updateMatrix();
        return this.inv;
    }
    getScreenPos(v: Vector): Vector {
        return this.getInverseMatrix().mul(v).add(this.center);
    }
    getWorldPos(v: Vector): Vector {
        return this.getMatrix().mul(v.sub(this.center));
    }
}
