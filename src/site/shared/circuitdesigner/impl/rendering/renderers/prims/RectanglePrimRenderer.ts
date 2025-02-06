import {RectanglePrim} from "core/internal/assembly/Prim";

import {BaseShapePrimRenderer} from "./BaseShapePrimRenderer";


export class RectanglePrimRenderer extends BaseShapePrimRenderer<RectanglePrim> {
    public override prePath(ctx: CanvasRenderingContext2D, prim: RectanglePrim): void {
        // Transform
        const [a,b,c,d,e,f] = prim.transform.getMatrix().mat;
        ctx.transform(a,b,c,d,e,f);
    }

    public override renderShape(ctx: CanvasRenderingContext2D, prim: RectanglePrim): void {
        const size = prim.transform.getSize();
        ctx.rect(-size.x/2, -size.y/2, size.x, size.y);
    }
}
