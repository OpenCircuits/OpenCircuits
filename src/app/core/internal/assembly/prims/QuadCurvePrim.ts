import {Vector} from "Vector";

import {Camera} from "core/schema/Camera";

import {Prim} from "../Prim";


/**
 * A representation of a Quadratic Bezier Curve shape.
 *
 * A Quadratic Bezier Curve is like a normal (Cubic) Bezier Curve but with
 *  a single control point rather than two control points.
 *
 * See https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Quadratic_curves.
 */
export class QuadCurvePrim implements Prim {
    public readonly kind = "QuadCurve";

    public readonly p1: Vector;
    public readonly p2: Vector;
    public readonly c: Vector;

    /**
     * Constructor for a quadratic bezier curve primitive.
     *
     * @param p1 The start point for the curve.
     * @param p2 The end point for the curve.
     * @param c  The control point for the curve.
     */
    public constructor(p1: Vector, p2: Vector, c: Vector) {
        this.p1 = p1;
        this.p2 = p2;
        this.c  = c;
    }

    public hitTest(pt: Vector): boolean {
        throw new Error("Method not implemented.");
    }

    public cull(camera: Camera): boolean {
        throw new Error("Method not implemented.");
    }
}
