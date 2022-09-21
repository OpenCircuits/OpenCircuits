import {Vector} from "Vector";

import {Shape} from "./Shape";


/**
 * A representation of a QuadCurve shape.
 */
export class QuadCurve implements Shape {
    private readonly p1: Vector;
    private readonly p2: Vector;
    private readonly c: Vector;

    /**
     * Constructor for QuadCurve.
     *
     * @param p1 The start point.
     * @param p2 The end point.
     * @param c  The control point.
     */
    public constructor(p1: Vector, p2: Vector, c: Vector) {
        this.p1 = p1;
        this.p2 = p2;
        this.c  = c;
    }

    /**
     * Draws the QuadCurve on the canvas.
     *
     * @param ctx Provides the 2D rendering context for the drawing surface of an element.
     */
    public draw(ctx: CanvasRenderingContext2D): void {
        const p1 = this.p1;
        const p2 = this.p2;
        const c  = this.c;

        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(c.x, c.y, p2.x, p2.y);
    }

}
