import {Vector} from "Vector";

import {Style}         from "../Style";
import {BaseShapePrim} from "./BaseShapePrim";


/**
 * A representation of a Circle shape.
 */
export class Circle extends BaseShapePrim {
    protected pos: Vector;
    protected radius: number;

    public constructor(pos: Vector, radius: number, style: Style) {
        super(style);
        this.pos = pos;
        this.radius = radius;
    }

    public override renderShape(ctx: CanvasRenderingContext2D): void {
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2*Math.PI);
    }
}
