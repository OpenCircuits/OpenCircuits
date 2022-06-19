import {Vector} from "Vector";

import {Shape} from "./Shape";


/**
 * A representation of a Circle shape.
 */
export class Circle implements Shape {
    protected pos: Vector;
    protected radius: number;

    /**
     * Constructor for Circle.
     *
     * @param pos    The position.
     * @param radius The radius.
     */
    public constructor(pos: Vector, radius: number) {
        this.pos = pos;
        this.radius = radius;
    }

    /**
     * Draws the Circle on the canvas.
     *
     * @param ctx Provides the 2D rendering context for the drawing surface of an element.
     */
    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2*Math.PI);
    }

}
