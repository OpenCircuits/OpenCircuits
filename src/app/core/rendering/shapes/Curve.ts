import {Vector} from "Vector";

import {BezierCurve} from "math/BezierCurve";

import {Shape} from "./Shape";


/**
 * A representation of a Curve shape.
 */
export class Curve implements Shape {
    protected curve: BezierCurve;

    /**
     * Constructor for Curve.
     *
     * @param curve Bezier curve.
     */
    public constructor(curve: BezierCurve);
    /**
     * Constructor for Curve.
     *
     * @param p1 Control point of curve.
     * @param p2 Control point of curve.
     * @param c1 Control point of curve.
     * @param c2 Control point of curve.
     */
    public constructor(p1: Vector, p2: Vector, c1: Vector, c2: Vector);
    /**
     * Constructor for Curve.
     *
     * @param p1 Bezier curve or control point of curve.
     * @param p2 Optional control point of curve.
     * @param c1 Optional control point of curve.
     * @param c2 Optional control point of curve.
     */
    public constructor(p1: Vector | BezierCurve, p2?: Vector, c1?: Vector, c2?: Vector) {
        this.curve = p1 instanceof BezierCurve ? p1 : new BezierCurve(p1, p2, c1, c2);
    }

    /**
     * Draws the Curve on the canvas.
     *
     * @param ctx Provides the 2D rendering context for the drawing surface of an element.
     */
    public draw(ctx: CanvasRenderingContext2D): void {
        const p1 = this.curve.getP1();
        const p2 = this.curve.getP2();
        const c1 = this.curve.getC1();
        const c2 = this.curve.getC2();

        ctx.moveTo(p1.x, p1.y);
        ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p2.x, p2.y);
    }

}
