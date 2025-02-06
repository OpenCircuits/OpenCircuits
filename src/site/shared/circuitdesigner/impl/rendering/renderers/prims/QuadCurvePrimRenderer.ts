import {QuadCurvePrim} from "core/internal/assembly/Prim";

import {BaseShapePrimRenderer} from "./BaseShapePrimRenderer";


export class QuadCurvePrimRenderer extends BaseShapePrimRenderer<QuadCurvePrim> {
    public override renderShape(ctx: CanvasRenderingContext2D, prim: QuadCurvePrim): void {
        const { p1, p2, c } = prim;

        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(c.x, c.y, p2.x, p2.y);
    }
}
