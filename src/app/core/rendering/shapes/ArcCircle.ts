import {Vector} from "Vector";

import {Circle} from "./Circle";


/**
 * A representation of an ArcCircle shape.
 */
export class ArcCircle extends Circle {
    protected a0 = 0;
    protected a1 = 2*Math.PI;

    /**
     * Constructor for ArcCircle.
     *
     * @param pos    The position.
     * @param radius The radius.
     * @param a0     The starting angle.
     * @param a1     The ending angle.
     */
    public constructor(pos: Vector, radius: number, a0: number, a1: number) {
        super(pos, radius);
        this.a0 = a0;
        this.a1 = a1;
    }

    /**
     * Draws the ArcCircle on the canvas.
     *
     * @param ctx Provides the 2D rendering context for the drawing surface of an element.
     */
    public override draw(ctx: CanvasRenderingContext2D): void {
        ctx.moveTo(this.pos.x, this.pos.y);
        let da = (this.a1 - this.a0) % (2*Math.PI);
        if (da < 0)
            da += 2*Math.PI;
        // Flip angles since y-axis is flipped
        ctx.arc(this.pos.x, this.pos.y, this.radius, 2*Math.PI - this.a0, 2*Math.PI - this.a1, da <= Math.PI);
    }

}
