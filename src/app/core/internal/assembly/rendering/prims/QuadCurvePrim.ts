import {Vector} from "Vector";

import {Style}         from "../Style";
import {BaseShapePrim} from "./BaseShapePrim";


/**
 * A representation of a Quadratic Bezier Curve shape.
 *
 * A Quadratic Bezier Curve is like a normal (Cubic) Bezier Curve but with
 *  a single control point rather than two control points.
 *
 * See https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Quadratic_curves.
 */
export class QuadCurvePrim extends BaseShapePrim {
    private readonly p1: Vector;
    private readonly p2: Vector;
    private readonly c: Vector;

    /**
     * Constructor for a quadratic bezier curve primitive.
     *
     * @param p1    The start point for the curve.
     * @param p2    The end point for the curve.
     * @param c     The control point for the curve.
     * @param style The draw-style for the curve.
     */
    public constructor(p1: Vector, p2: Vector, c: Vector, style: Style) {
        super(style);

        this.p1 = p1;
        this.p2 = p2;
        this.c  = c;
    }

    protected override renderShape(ctx: CanvasRenderingContext2D): void {
        const { p1, p2, c } = this;

        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(c.x, c.y, p2.x, p2.y);
    }

}
