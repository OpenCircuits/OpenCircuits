import {SVGDrawing} from "svg2canvas";

import {SVGPrim} from "core/internal/assembly/Prim";

import {PrimRenderer} from "../PrimRenderer";


export class SVGPrimRenderer extends PrimRenderer<SVGPrim> {
    protected readonly svgMap: Map<string, SVGDrawing>;

    public constructor(svgMap: Map<string, SVGDrawing>) {
        super({});

        this.svgMap = svgMap;
    }

    public override render(ctx: CanvasRenderingContext2D, prim: SVGPrim): void {
        if (!prim.svg || !this.svgMap.has(prim.svg)) // Don't draw if the image isn't loaded
            return;

        ctx.save();

        const [a,b,c,d,e,f] = prim.transform.getMatrix().mat;
        ctx.transform(a,b,c,d,e,f);

        const svg = this.svgMap.get(prim.svg)!;
        svg.draw(ctx, 0, 0, prim.transform.getSize().x, -prim.transform.getSize().y, prim.tint);

        ctx.restore();
    }
}
