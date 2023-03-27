import {Color, SVGDrawing, parseColor} from "svg2canvas";

import {Vector} from "Vector";

import {Transform} from "math/Transform";

import {Camera} from "core/schema/Camera";

import {Prim}  from "../../Prim";
import {Style} from "../Style";


/**
 * A representation of a SVG shape.
 *
 * Note: currently the contents of the SVG are ignored for hit-testings and culling.
 *  Instead, it is treated as a rectangle around the bounds of the SVG.
 */
export class SVGPrim implements Prim {
    protected svg: SVGDrawing;
    protected size: Vector;
    protected transform: Transform;
    protected tint?: Color;

    /**
     * Constructor for a SVG primitive.
     *
     * @param svg       The SVG drawing to draw.
     * @param size      The size of the SVG, also dictates the bounds of the hit-testing for this SVG.
     * @param transform The transform for this SVG, note that the size of the transform is ignored.
     * @param tint      An optional tinting color to apply over the SVG.
     */
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

        const [a,b,c,d,e,f] = this.transform.getMatrix().mat;
        ctx.transform(a,b,c,d,e,f);

        this.svg.draw(ctx, 0, 0, this.size.x, -this.size.y, this.tint);

        ctx.restore();
    }
    public updateStyle(style: Style): void {
        if (!style.fill) {
            this.tint = undefined;
            return;
        }

        if (typeof style.fill !== "string")
            throw new Error("Cannot have an SVG with a Gradient tint!");
        this.tint = parseColor(style.fill);
    }
}
