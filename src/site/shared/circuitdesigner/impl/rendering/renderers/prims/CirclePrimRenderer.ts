import {CirclePrim} from "core/internal/assembly/Prim";

import {BaseShapePrimRenderer} from "./BaseShapePrimRenderer";


export class CirclePrimRenderer extends BaseShapePrimRenderer<CirclePrim> {
    public override renderShape(ctx: CanvasRenderingContext2D, prim: CirclePrim): void {
        ctx.arc(prim.pos.x, prim.pos.y, prim.radius, 0, 2*Math.PI);
    }
}
