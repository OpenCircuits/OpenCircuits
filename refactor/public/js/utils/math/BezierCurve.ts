import {Vector,V}  from "./Vector";
import {Transform} from "./Transform";

export class BezierCurve {
    private p1: Vector;
    private p2: Vector;
    private c1: Vector;
    private c2: Vector;

    private boundingBox: Transform;
    private dirty: boolean;

    public constructor(p1: Vector, p2: Vector, c1: Vector, c2: Vector) {
        this.p1 = p1.copy();
        this.p2 = p2.copy();
        this.c1 = c1.copy();
        this.c2 = c2.copy();
        this.dirty = true;
        this.boundingBox = new Transform(V(0), V(0));
    }

    private updateBoundingBox(): void {
        if (!this.dirty)
            return;
        this.dirty = false;

        // calculate the min and max positions of the curve
        var min = V(0, 0);
        var max = V(0, 0);
        var end1 = this.getPos(0);
        var end2 = this.getPos(1);
        var a = this.c1.sub(this.c2).scale(3).add(this.p2.sub(this.p1));
        var b = this.p1.sub(this.c1.scale(2).add(this.c2)).scale(2);
        var c = this.c1.sub(this.p1);

        var discriminant1 = b.y*b.y - 4*a.y*c.y;
        discriminant1 = (discriminant1 >= 0 ? Math.sqrt(discriminant1) : -1);
        var t1 = (discriminant1 !== -1 ? clamp((-b.y + discriminant1)/(2*a.y),0,1) : 0);
        var t2 = (discriminant1 !== -1 ? clamp((-b.y - discriminant1)/(2*a.y),0,1) : 0);
        max.y = Math.max(this.getY(t1), this.getY(t2), end1.y, end2.y);
        min.y = Math.min(this.getY(t1), this.getY(t2), end1.y, end2.y);

        var discriminant2 = b.x*b.x - 4*a.x*c.x;
        discriminant2 = (discriminant2 >= 0 ? Math.sqrt(discriminant2) : -1);
        var t3 = (discriminant2 !== -1 ? clamp((-b.x + discriminant2)/(2*a.x),0,1) : 0);
        var t4 = (discriminant2 !== -1 ? clamp((-b.x - discriminant2)/(2*a.x),0,1) : 0);
        max.x = Math.max(this.getX(t1), this.getX(t2), end1.x, end2.x);
        min.x = Math.min(this.getX(t1), this.getX(t2), end1.x, end2.x);

        this.boundingBox.setSize(V(max.x - min.x, max.y - min.y));
        this.boundingBox.setPos(V((max.x - min.x)/2 + min.x, (max.y - min.y)/2 + min.y));
    }

    public getP1(): Vector {
        return this.p1.copy();
    }

    public getP2(): Vector {
        return this.p2.copy();
    }

    public getC1(): Vector {
        return this.c1.copy();
    }

    public getC2(): Vector {
        return this.c2.copy();
    }

    public getX(t: number): number {
        var it = 1 - t;
        return this.p1.x*it*it*it + 3*this.c1.x*t*it*it + 3*this.c2.x*t*t*it + this.p2.x*t*t*t;
    }

    public getY(t: number): number {
        var it = 1 - t;
        return this.p1.y*it*it*it + 3*this.c1.y*t*it*it + 3*this.c2.y*t*t*it + this.p2.y*t*t*t;
    }

    public getPos(t: number): Vector {
        return V(this.getX(t), this.getY(t));
    }

}
