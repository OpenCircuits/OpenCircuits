import {BezierCurvePrim} from "core/internal/assembly/Prim";

import {BaseShapePrimRenderer} from "./BaseShapePrimRenderer";


export class BezierCurvePrimRenderer extends BaseShapePrimRenderer<BezierCurvePrim> {
    public override renderShape(ctx: CanvasRenderingContext2D, prim: BezierCurvePrim): void {
        const { p1, p2, c1, c2 } = prim.curve;

        ctx.moveTo(p1.x, p1.y);
        ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p2.x, p2.y);
    }
}
