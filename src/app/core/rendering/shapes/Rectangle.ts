import {Vector} from "Vector";

import {Transform} from "math/Transform";

import {Shape} from "./Shape";


/**
 * A representation of a Rectangle shape.
 */
export class Rectangle implements Shape {
    protected pos: Vector;
    protected size: Vector;

    /**
     * Constructor for Rectangle.
     *
     * @param transform Transform spatial information.
     */
    public constructor(transform: Transform);
    /**
     * Constructor for Rectangle.
     *
     * @param pos  Position.
     * @param size Dimensions.
     */
    public constructor(pos: Vector, size: Vector);
    /**
     * Constructor for Rectangle.
     *
     * @param pos  Position or transform spatial information.
     * @param size Dimensions.
     */
    public constructor(pos: Vector | Transform, size?: Vector) {
        if (pos instanceof Transform) {
            this.pos  = pos.getPos();
            this.size = pos.getSize();
        } else {
            this.pos  = pos;
            this.size = size!;
        }
    }

    /**
     * Draws the Rectangle on the canvas.
     *
     * @param ctx Provides the 2D rendering context for the drawing surface of an element.
     */
    public draw(ctx: CanvasRenderingContext2D): void {
        const center = this.pos.sub(this.size.scale(0.5));

        ctx.rect(center.x, center.y, this.size.x, this.size.y);
    }

}
