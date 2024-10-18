import {Vector} from "Vector";

import {Style}         from "../Style";
import {BaseShapePrim} from "./BaseShapePrim";


/**
 * A representation of a QuadCurve shape.
 */
export class QuadCurve extends BaseShapePrim {
    protected readonly p1: Vector;
    protected readonly p2: Vector;
    protected readonly c: Vector;

    /**
     * Constructor for QuadCurve.
     *
     * @param p1 The start point.
     * @param p2 The end point.
     * @param c  The control point.
     */
    public constructor(p1: Vector, p2: Vector, c: Vector, style: Style) {
        super(style);

        this.p1 = p1;
        this.p2 = p2;
        this.c  = c;
    }

    /**
     * Draws the QuadCurve on the canvas.
     *
     * @param ctx Provides the 2D rendering context for the drawing surface of an element.
     */
    protected override renderShape(ctx: CanvasRenderingContext2D): void {
        const { p1, p2, c } = this;

        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(c.x, c.y, p2.x, p2.y);
    }
}
