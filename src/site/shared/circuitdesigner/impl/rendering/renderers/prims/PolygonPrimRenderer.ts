import {PolygonPrim} from "core/internal/assembly/Prim";

import {BaseShapePrimRenderer} from "./BaseShapePrimRenderer";


export class PolygonPrimRenderer extends BaseShapePrimRenderer<PolygonPrim> {
    public override renderShape(ctx: CanvasRenderingContext2D, prim: PolygonPrim): void {
        const { points } = prim;

        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++)
            ctx.lineTo(points[i].x, points[i].y);
        ctx.lineTo(points[0].x, points[0].y);
    }
}
