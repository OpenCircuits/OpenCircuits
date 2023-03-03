import {Color, SVGDrawing, parseColor} from "svg2canvas";

import {V, Vector} from "Vector";

import {Camera} from "core/schema/Camera";

import {Prim}      from "../../Prim";
import {Style}     from "../Style";
import {Transform} from "math/Transform";


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
        throw new Error("Method not implemented.");
    }
    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        const m = this.transform.getMatrix();
        ctx.transform(
            m.get(0), m.get(1),
            m.get(2), m.get(3),
            m.get(4), m.get(5),
        );
        this.svg.draw(ctx, 0, 0, this.size.x, -this.size.y, this.tint);
        ctx.restore();
    }
    public updateStyle(style: Style): void {
        this.tint = (style.fillColor ? parseColor(style.fillColor as string) : undefined);
    }
}
