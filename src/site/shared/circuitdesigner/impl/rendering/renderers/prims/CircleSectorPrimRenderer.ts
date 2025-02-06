import {CircleSectorPrim} from "core/internal/assembly/Prim";

import {BaseShapePrimRenderer} from "./BaseShapePrimRenderer";


export class CircleSectorPrimRenderer extends BaseShapePrimRenderer<CircleSectorPrim> {
    public override renderShape(ctx: CanvasRenderingContext2D, prim: CircleSectorPrim): void {
        const { pos: { x, y }, radius, angles: [a0, a1] } = prim;

        ctx.moveTo(x, y);
        let da = (a1 - a0) % (2*Math.PI);
        if (da < 0)
            da += 2*Math.PI;
        ctx.arc(x, y, radius, a0, a1, da > Math.PI);
    }
}
