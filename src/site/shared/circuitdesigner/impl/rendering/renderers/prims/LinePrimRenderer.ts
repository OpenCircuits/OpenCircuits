import {LinePrim} from "core/internal/assembly/Prim";

import {BaseShapePrimRenderer} from "./BaseShapePrimRenderer";


export class LinePrimRenderer extends BaseShapePrimRenderer<LinePrim> {
    public override renderShape(ctx: CanvasRenderingContext2D, prim: LinePrim): void {
        const { p1, p2 } = prim;

        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
    }
}
