import {Vector} from "Vector";

import {Shape} from "./Shape";


/**
 * A representation of a QuadCurve shape.
 */
export class QuadCurve implements Shape {
    private p1: Vector;
    private p2: Vector;
    private c: Vector;

    /**
     * Constructor for QuadCurve
     * 
     * @param p1 start point
     * @param p2 end point
     * @param c control point
     */
    public constructor(p1: Vector, p2: Vector, c: Vector) {
        this.p1 = p1;
        this.p2 = p2;
        this.c  = c;
    }

    /**
     * Draws the QuadCurve on the canvas
     * 
     * @param ctx provides the 2D rendering context for the drawing surface of an element
     */
    public draw(ctx: CanvasRenderingContext2D): void {
        const p1 = this.p1;
        const p2 = this.p2;
        const c  = this.c;

        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(c.x, c.y, p2.x, p2.y);
    }

}
