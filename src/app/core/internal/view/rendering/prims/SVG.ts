import {Color, SVGDrawing, parseColor} from "svg2canvas";

import {Vector} from "Vector";

import {Transform} from "math/Transform";

import {Camera} from "core/schema/Camera";

import {Prim}         from "../../Prim";
import {Style}        from "../Style";
import {RectContains} from "math/MathUtils";


export class SVGPrim implements Prim {
    protected svg: SVGDrawing;
    protected size: Vector;
    protected transform: Transform;
    protected tint?: Color;

    public constructor(svg: SVGDrawing, size: Vector, transform: Transform, tint?: string) {
        this.svg = svg;
        this.size = size;
        this.transform = transform;
        this.tint = (tint ? parseColor(tint) : undefined);
    }

    public cull(camera: Camera): boolean {
        throw new Error("Method not implemented.");
    }
    public hitTest(pt: Vector): boolean {
        return RectContains(this.transform, pt);
    }
    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        const [a,b,c,d,e,f] = this.transform.getMatrix().mat;
        ctx.transform(a,b,c,d,e,f);

        this.svg.draw(ctx, 0, 0, this.size.x, -this.size.y, this.tint);

        ctx.restore();
    }
    public updateStyle(style: Style): void {
        this.tint = (style.fillColor ? parseColor(style.fillColor as string) : undefined);
    }
}
