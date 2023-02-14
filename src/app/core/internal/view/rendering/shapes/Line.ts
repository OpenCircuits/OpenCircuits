import {Vector} from "Vector";

import {Shape} from "./Shape";


/**
 * A representation of a Line shape.
 */
export class Line implements Shape {
    protected p1: Vector;
    protected p2: Vector;

    /**
     * Constructor for Line.
     *
     * @param p1 The start point.
     * @param p2 The end point.
     */
    public constructor(p1: Vector, p2: Vector) {
        this.p1 = p1;
        this.p2 = p2;
    }

    /**
     * Draws the Line on the canvas.
     *
     * @param ctx Provides the 2D rendering context for the drawing surface of an element.
     */
    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
    }

}
