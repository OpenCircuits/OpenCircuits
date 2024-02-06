import {serializable, serialize} from "serialeazy";

import {Clamp}     from "./MathUtils";
import {Transform} from "./Transform";
import {V, Vector} from "./Vector";


/**
 * Cubic Bezier Curve class.
 *
 * Consists of a start point, an end point,
 * 2 control points, and the bounding
 * box for the curve.
 *
 * Link to an interactive cubic bezier curve with formulas:
 * https://www.desmos.com/calculator/rptlhv5rx8.
 */
 @serializable("BezierCurve")
export class BezierCurve {

    /**
     * The x, y coordinates of the start point.
     */
    @serialize
    private p1: Vector;

    /**
     * The x, y coordinates of the end point.
     */
    @serialize
    private p2: Vector;

    /**
     * The x, y coordinates of the first control point.
     */
    @serialize
    private c1: Vector;

    /**
     * The x, y coordinates of the second control point.
     */
    @serialize
    private c2: Vector;

    /**
     * The Bounding Box that encases the entire curve.
     */
    private readonly boundingBox: Transform;

    /**
     * Whether the curve's data has been updated.
     */
    private dirty: boolean;

    /**
     * Initializes bezier curve with the given start point, end point, and intermediate points.
     * If no point(s) are given, then it will be initialized with a blank Vector.
     * Bounding Box holds meaningless values by default.
     *
     * @param p1 Initializes start point with given coordinates.
     * @param p2 Initializes end point with given coordinates.
     * @param c1 Initializes first control point with given coordinates.
     * @param c2 Initializes second control point with given coordinates.
     */
    public constructor(p1: Vector = V(), p2: Vector = V(), c1: Vector = V(), c2: Vector = V()) {
        this.p1 = p1.copy();
        this.p2 = p2.copy();
        this.c1 = c1.copy();
        this.c2 = c2.copy();

        this.dirty = true;
        this.boundingBox = new Transform(V(0), V(0));
    }

    /**
     * Calculates t by using the quadratic formula with the given a, b, and c.
     *
     * @param a   The a value in the quadratic formula.
     * @param b   The b value in the quadratic formula.
     * @param c   The c value in the quadratic formula.
     * @param mod The +/- in the quadratic formula.
     * @param end Returns end if result is undefined.
     * @returns     The value of t, where t represents how far along the bezier curve the given point is.
     */
    private getT(a: number, b: number, c: number, mod: -1 | 1, end: number): number {
        if (a === 0)
            return end;
        const d = b*b - 4*a*c;
        if (d < 0)
            return end;
        return Clamp((-b + mod*Math.sqrt(d)) / (2*a), 0, 1);
    }

    /**
     * Calculates the position and size of the bounding box,
     * based on p1, p2, c1, and c2.
     */
    private updateBoundingBox(): void {
        if (!this.dirty)
            return;
        this.dirty = false;

        const min = V(0, 0);
        const max = V(0, 0);
        const end1 = this.getPos(0);
        const end2 = this.getPos(1);

        const a = this.c1.sub(this.c2).scale(3).add(this.p2.sub(this.p1));
        const b = this.p1.sub(this.c1.scale(2)).add(this.c2).scale(2);
        const c = this.c1.sub(this.p1);

        const t1 = this.getT(a.y, b.y, c.y,  1, 0);
        const t2 = this.getT(a.y, b.y, c.y, -1, 1);
        max.y = Math.max(this.getY(t1), this.getY(t2), end1.y, end2.y);
        min.y = Math.min(this.getY(t1), this.getY(t2), end1.y, end2.y);

        const t3 = this.getT(a.x, b.x, c.x,  1, 0);
        const t4 = this.getT(a.x, b.x, c.x, -1, 1);
        max.x = Math.max(this.getX(t3), this.getX(t4), end1.x, end2.x);
        min.x = Math.min(this.getX(t3), this.getX(t4), end1.x, end2.x);

        this.boundingBox.setSize(V(max.x - min.x, max.y - min.y));
        this.boundingBox.setPos(V((max.x - min.x)/2 + min.x, (max.y - min.y)/2 + min.y));
    }

    /**
     * Changes start point (P1), for Bezier curve.
     *
     * @param v The x, y coordinates to set the point to.
     */
    public setP1(v: Vector): void {
        this.dirty = true;
        this.p1 = v;
    }

    /**
     * Changes end point (P2) for Bezier curve.
     *
     * @param v The x, y coordinates to set the point to.
     */
    public setP2(v: Vector): void {
        this.dirty = true;
        this.p2 = v;
    }

    /**
     * Changes first control point (C1) for Bezier curve.
     *
     * @param v The x, y coordinates to set the point to.
     */
    public setC1(v: Vector): void {
        this.dirty = true;
        this.c1 = v;
    }

    /**
     * Changes second control point (C2) for Bezier curve.
     *
     * @param v The x, y coordinates to set the point to.
     */
    public setC2(v: Vector): void {
        this.dirty = true;
        this.c2 = v;
    }

    /**
     * Returns start point of curve (p1).
     *
     * @returns The x, y coordinates of the start point.
     */
    public getP1(): Vector {
        return this.p1.copy();
    }

    /**
     * Returns end point of curve (p2).
     *
     * @returns The x, y coordinates of the end point.
     */
    public getP2(): Vector {
        return this.p2.copy();
    }

    /**
     * Returns first control point (C1) for Bezier curve.
     *
     * @returns The x, y coordinates of the first control point.
     */
    public getC1(): Vector {
        return this.c1.copy();
    }

    /**
     * Returns second control point (C2) for Bezier curve.
     *
     * @returns The x, y coordinates of the second control point.
     */
    public getC2(): Vector {
        return this.c2.copy();
    }

    /**
     * Calculates x coordinate of t.
     *
     * @param t How far along the bezier curve the given point is.
     * @returns   The x coordinate of t.
     */
    public getX(t: number): number {
        const it = 1 - t;
        return this.p1.x*it*it*it + 3*this.c1.x*t*it*it + 3*this.c2.x*t*t*it + this.p2.x*t*t*t;
    }

    /**
     * Calculates y coordinate of t.
     *
     * @param t How far along the bezier curve the given point is.
     * @returns   The y coordinate of t.
     */
    public getY(t: number): number {
        const it = 1 - t;
        return this.p1.y*it*it*it + 3*this.c1.y*t*it*it + 3*this.c2.y*t*t*it + this.p2.y*t*t*t;
    }

    /**
     * Calculates x and y coordinates of t.
     *
     * @param t How far along the bezier curve the given point is.
     * @returns   The x and y coordinates of t.
     */
    public getPos(t: number): Vector {
        return V(this.getX(t), this.getY(t));
    }

    /**
     * Calculates the 1st derivative of x coord of t.
     *
     * @param t How far along the bezier curve the given point is.
     * @returns   The 1st derivative of x coord of t.
     */
    public getDX(t: number): number {
        const it = 1 - t;
        return -3*this.p1.x*it*it + 3*this.c1.x*it*(1-3*t) + 3*this.c2.x*t*(2-3*t) + 3*this.p2.x*t*t;
    }

    /**
     * Calculates the 1st derivative of y coord of t.
     *
     * @param t How far along the bezier curve the given point is.
     * @returns   The 1st derivative of y coord of t.
     */
    public getDY(t: number): number {
        const it = 1 - t;
        return -3*this.p1.y*it*it + 3*this.c1.y*it*(1-3*t) + 3*this.c2.y*t*(2-3*t) + 3*this.p2.y*t*t;
    }

    /**
     * Calculates the 1st derivatives of x and y coordinates of t.
     *
     * @param t How far along the bezier curve the given point is.
     * @returns   The 1st derivatives of x and y coordinates of t.
     */
    public getDerivative(t: number): Vector {
        return V(this.getDX(t), this.getDY(t));
    }

    /**
     * Calculates the 2nd derivative of x coordinate of t.
     *
     * @param t How far along the bezier curve the given point is.
     * @returns   The 2nd derivative of x coordinate of t.
     */
    public getDDX(t: number): number {
        const m = -this.p1.x + 3*this.c1.x - 3*this.c2.x + this.p2.x;
        const b = this.p1.x - 2*this.c1.x + this.c2.x;
        return 6*(m * t + b);
    }

    /**
     * Calculates the 2nd derivative of y coordinate of t.
     *
     * @param t How far along the bezier curve the given point is.
     * @returns   The 2nd derivative of y coordinate of t.
     */
    public getDDY(t: number): number {
        const m = -this.p1.y + 3*this.c1.y - 3*this.c2.y + this.p2.y;
        const b = this.p1.y - 2*this.c1.y + this.c2.y;
        return 6*(m * t + b);
    }

    /**
     * Calculates the 2nd derivatives of x and y coordinates of t.
     *
     * @param t How far along the bezier curve the given point is.
     * @returns   The 2nd derivative of x and y coordinates of t.
     */
    public get2ndDerivative(t: number): Vector {
        return V(this.getDDX(t), this.getDDY(t));
    }

    /**
     * Bounding box accessor updates the bounding box and returns it.
     *
     * @returns A Transform that contains the bounding box of the curve.
     */
    public getBoundingBox(): Transform {
        this.updateBoundingBox();
        return this.boundingBox.copy();
    }
}
