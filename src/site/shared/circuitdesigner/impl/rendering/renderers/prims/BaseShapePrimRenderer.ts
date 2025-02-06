import {PrimRenderer} from "../PrimRenderer";
import {Prim, SVGPrim} from "core/internal/assembly/Prim";


type ShapePrims = Exclude<Prim, SVGPrim>;

export abstract class BaseShapePrimRenderer<P extends ShapePrims> extends PrimRenderer<P> {
    protected abstract renderShape(ctx: CanvasRenderingContext2D, prim: P): void;

    protected prePath(_ctx: CanvasRenderingContext2D, _prim: P): void {}

    public override render(ctx: CanvasRenderingContext2D, prim: P): void {
        // Set style
        if (prim.style.fill !== undefined)
            ctx.fillStyle = prim.style.fill;
        if (prim.style.stroke !== undefined) {
            ctx.strokeStyle = prim.style.stroke.color;
            ctx.lineWidth = prim.style.stroke.size;
            if (prim.style.stroke.lineCap !== undefined)
                ctx.lineCap = prim.style.stroke.lineCap;
        }
        if (prim.style.alpha !== undefined)
            ctx.globalAlpha = prim.style.alpha;

        ctx.save();

        this.prePath(ctx, prim);

        ctx.beginPath();

        this.renderShape(ctx, prim);

        if (prim.style.fill)
            ctx.fill();
        if (prim.style.stroke && prim.style.stroke.size > 0)
            ctx.stroke();

        ctx.closePath();

        ctx.restore();

        // Reset alpha if we set it
        if (prim.style.alpha !== undefined)
            ctx.globalAlpha = 1;
    }
}
