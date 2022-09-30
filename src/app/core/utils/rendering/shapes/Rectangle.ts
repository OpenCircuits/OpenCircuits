import {Vector} from "Vector";

import {Rect} from "math/Rect";

import {Shape} from "./Shape";


/**
 * A representation of a Rectangle shape.
 */
export class Rectangle implements Shape {
    protected rect: Rect;

    /**
     * Constructor for Rectangle.
     *
     * @param rect Rectangle bounds.
     */
    public constructor(rect: Rect);
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
     * @param args The arguments.
     */
    public constructor(...args: [Rect] | [Vector, Vector]) {
        switch (args.length) {
            case 1:
                this.rect = args[0];
                break;
            case 2:
                this.rect = new Rect(...args);
                break;
        }
    }

    /**
     * Draws the Rectangle on the canvas.
     *
     * @param ctx Provides the 2D rendering context for the drawing surface of an element.
     */
    public draw(ctx: CanvasRenderingContext2D): void {
        const { bottomLeft, size } = this.rect;

        ctx.rect(bottomLeft.x, bottomLeft.y, size.x, size.y);
    }

}
