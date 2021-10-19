import { Vector, V } from "./Vector";
import { Transform } from "./Transform";
import { Clamp } from "./MathUtils";
import { serializable } from "serialeazy";

/*
 * Quadratic bezier curve class
 */
@serializable("BezierCurve")
export class BezierCurve {
    private p1: Vector; //initial position
    private p2: Vector; //terminating postion
    private c1: Vector; //middle point it curves towards
    private c2: Vector; //middle point it arrives from

    private boundingBox: Transform;
    private dirty: boolean; //Keeps track of whether bounding box has been updated

    /*
     * Initializes bezier curve with the given start point, end point, and intermediate points.
     * Bounding Box holds meaningless values by default
     */
    public constructor(p1: Vector = V(), p2: Vector = V(), c1: Vector = V(), c2: Vector = V()) {
        this.p1 = p1.copy();
        this.p2 = p2.copy();
        this.c1 = c1.copy();
        this.c2 = c2.copy();

        this.dirty = true;
        this.boundingBox = new Transform(V(0), V(0));
    }

    /*
     * Calculates and returns t, t represents how far along the bezier curve 
     * the given point is.
    */
    private getT(a: number, b: number, c: number, mod: -1 | 1, end: number): number {
        if (a == 0)
            return end;
        const d = b * b - 4 * a * c;
        if (d < 0)
            return end;
        return Clamp((-b + mod * Math.sqrt(d)) / (2 * a), 0, 1);
    }

    /*
     * Calculates the position and size of the bounding box, 
     * based on p1, p2, c1, and c2.
     */
    private updateBoundingBox(): void {
        // If dirty is false, bounding box hasn't been updated yet from meaningless values
        // If dirty is true, it has been updated
        if (!this.dirty)
            return;
        this.dirty = false;

        // Calculating the min and max positions of the curve
        const min = V(0, 0);
        const max = V(0, 0);
        const end1 = this.getPos(0);
        const end2 = this.getPos(1);

        const a = this.c1.sub(this.c2).scale(3).add(this.p2.sub(this.p1));
        const b = this.p1.sub(this.c1.scale(2)).add(this.c2).scale(2);
        const c = this.c1.sub(this.p1);

        const t1 = this.getT(a.y, b.y, c.y, 1, 0);
        const t2 = this.getT(a.y, b.y, c.y, -1, 1);
        max.y = Math.max(this.getY(t1), this.getY(t2), end1.y, end2.y);
        min.y = Math.min(this.getY(t1), this.getY(t2), end1.y, end2.y);

        const t3 = this.getT(a.x, b.x, c.x, 1, 0);
        const t4 = this.getT(a.x, b.x, c.x, -1, 1);
        max.x = Math.max(this.getX(t3), this.getX(t4), end1.x, end2.x);
        min.x = Math.min(this.getX(t3), this.getX(t4), end1.x, end2.x);

        // Sets position and size based on the maximum and minimum positions of the curve
        this.boundingBox.setSize(V(max.x - min.x, max.y - min.y));
        this.boundingBox.setPos(V((max.x - min.x) / 2 + min.x, (max.y - min.y) / 2 + min.y));
    }

    //Changes start point (P1), for Bezier curve
    public setP1(v: Vector): void {
        this.dirty = true;
        this.p1 = v;
    }

    //Changes end point (P2) for Bezier curve
    public setP2(v: Vector): void {
        this.dirty = true;
        this.p2 = v;
    }

    //Changes partway point (C1) for Bezier curve
    public setC1(v: Vector): void {
        this.dirty = true;
        this.c1 = v;
    }

    //Changes partway point (C2) for Bezier curve
    public setC2(v: Vector): void {
        this.dirty = true;
        this.c2 = v;
    }

    //Returns p1
    public getP1(): Vector {
        return this.p1.copy();
    }

    //Returns p2
    public getP2(): Vector {
        return this.p2.copy();
    }

    //Returns c1
    public getC1(): Vector {
        return this.c1.copy();
    }

    //Returns c2
    public getC2(): Vector {
        return this.c2.copy();
    }

    // Calculates and returns x coordinate of t 
    public getX(t: number): number {
        const it = 1 - t;
        return this.p1.x * it * it * it + 3 * this.c1.x * t * it * it + 3 * this.c2.x * t * t * it + this.p2.x * t * t * t;
    }

    // Calculates and returns y coordinate of t 
    public getY(t: number): number {
        const it = 1 - t;
        return this.p1.y * it * it * it + 3 * this.c1.y * t * it * it + 3 * this.c2.y * t * t * it + this.p2.y * t * t * t;
    }

    // Feturns x and y coordinates of t
    public getPos(t: number): Vector {
        return V(this.getX(t), this.getY(t));
    }

    // Calculates and returns the 1st derivative of x coord of t
    public getDX(t: number): number {
        const it = 1 - t;
        return -3 * this.p1.x * it * it + 3 * this.c1.x * it * (1 - 3 * t) + 3 * this.c2.x * t * (2 - 3 * t) + 3 * this.p2.x * t * t;
    }

    // Calculates and returns the 1st derivative of y coord of t
    public getDY(t: number): number {
        const it = 1 - t;
        return -3 * this.p1.y * it * it + 3 * this.c1.y * it * (1 - 3 * t) + 3 * this.c2.y * t * (2 - 3 * t) + 3 * this.p2.y * t * t;
    }

    // Returns the 1st derivatives of x and y coords of t
    public getDerivative(t: number): Vector {
        return V(this.getDX(t), this.getDY(t));
    }

    // Calculates and returns the 2nd derivative of x coord of t
    public getDDX(t: number): number {
        const m = -this.p1.x + 3 * this.c1.x - 3 * this.c2.x + this.p2.x;
        const b = this.p1.x - 2 * this.c1.x + this.c2.x;
        return 6 * (m * t + b);
    }

    // Calculates and returns the 2nd derivative of y coord of t
    public getDDY(t: number): number {
        const m = -this.p1.y + 3 * this.c1.y - 3 * this.c2.y + this.p2.y;
        const b = this.p1.y - 2 * this.c1.y + this.c2.y;
        return 6 * (m * t + b);
    }

    // Returns the 2nd Derivatives of x and y coords of t
    public get2ndDerivative(t: number): Vector {
        return V(this.getDDX(t), this.getDDY(t));
    }

    /* 
     * Bounding box accessor updates the bounding box and returns it.
    */
    public getBoundingBox(): Transform {
        this.updateBoundingBox();
        return this.boundingBox.copy();
    }
}
