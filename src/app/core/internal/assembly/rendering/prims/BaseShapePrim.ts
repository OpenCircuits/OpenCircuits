import {Vector} from "Vector";

import {Prim}   from "../../Prim";
import {Style}  from "../Style";
import {Schema} from "core/schema";


export abstract class BaseShapePrim implements Prim {
    protected style: Style;

    protected constructor(style: Style) {
        this.style = style;
    }

    public cull(camera: Schema.Camera): boolean {
        throw new Error("Method not implemented.");
    }
    public hitTest(pt: Vector): boolean {
        throw new Error("Method not implemented.");
    }

    protected abstract renderShape(ctx: CanvasRenderingContext2D): void;

    protected prePath(ctx: CanvasRenderingContext2D): void {}

    public render(ctx: CanvasRenderingContext2D): void {
        // Set style
        if (this.style.fill !== undefined)
            ctx.fillStyle = this.style.fill;
        if (this.style.stroke !== undefined) {
            ctx.strokeStyle = this.style.stroke.color;
            ctx.lineWidth = this.style.stroke.size;
            if (this.style.stroke.lineCap !== undefined)
                ctx.lineCap = this.style.stroke.lineCap;
        }
        if (this.style.alpha !== undefined)
            ctx.globalAlpha = this.style.alpha;

        ctx.save();

        this.prePath(ctx);

        ctx.beginPath();

        this.renderShape(ctx);

        if (this.style.fill)
            ctx.fill();
        if (this.style.stroke && this.style.stroke.size > 0)
            ctx.stroke();

        ctx.closePath();

        ctx.restore();

        // Reset alpha if we set it
        if (this.style.alpha !== undefined)
            ctx.globalAlpha = 1;
    }

    public updateStyle(style: Style): void {
        this.style = style;
    }
}
