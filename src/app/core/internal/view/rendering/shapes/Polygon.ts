import {Vector} from "Vector";

import {Shape} from "./Shape";


/**
 * A representation of a Polygon shape.
 */
export class Polygon implements Shape {
    protected points: Vector[];

    /**
     * Constructor for Polygon.
     *
     * @param points List of vertices.
     */
    public constructor(points: Vector[]) {
        this.points = points;
    }

    /**
     * Draws the Polygon on the canvas.
     *
     * @param ctx Provides the 2D rendering context for the drawing surface of an element.
     */
    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++)
            ctx.lineTo(this.points[i].x, this.points[i].y);
        ctx.lineTo(this.points[0].x, this.points[0].y);
    }

}
