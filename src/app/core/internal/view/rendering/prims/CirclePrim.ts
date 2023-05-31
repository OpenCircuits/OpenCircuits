import {Vector} from "Vector";

import {Style}          from "../Style";
import {BaseShapePrim}  from "./BaseShapePrim";
import {CircleContains} from "math/MathUtils";


/**
 * A representation of a Circle shape.
 */
export class CirclePrim extends BaseShapePrim {
    protected pos: Vector;
    protected radius: number;

    /**
     * Constructor for a circle primitive.
     *
     * @param pos    The position of the center of the circle.
     * @param radius The radius of the circle.
     * @param style  The draw-style for the circle.
     */
    public constructor(pos: Vector, radius: number, style: Style) {
        super(style);

        this.pos = pos;
        this.radius = radius;
    }

    public override hitTest(pt: Vector): boolean {
        return CircleContains(this.pos, this.radius, pt);
    }

    protected override renderShape(ctx: CanvasRenderingContext2D): void {
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2*Math.PI);
    }
}
