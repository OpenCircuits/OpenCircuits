import {Vector} from "Vector";

import {Style}         from "../Style";
import {BaseShapePrim} from "./BaseShapePrim";


/**
 * A representation of a Line shape.
 */
export class Line extends BaseShapePrim {
    protected readonly p1: Vector;
    protected readonly p2: Vector;

    public constructor(p1: Vector, p2: Vector, style: Style) {
        super(style);

        this.p1 = p1;
        this.p2 = p2;
    }

    public override hitTest(pt: Vector): boolean {
        // TODO: Maybe allow lines to be hit ?
        return false;
    }

    protected override renderShape(ctx: CanvasRenderingContext2D): void {
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
    }
}
