import {SVGDrawing} from "svg2canvas";

import {BaseShapePrimWithoutStyle, Prim} from "shared/api/circuit/internal/assembly/Prim";
import {DebugOptions} from "shared/api/circuitdesigner/public/impl/DebugOptions";


function DrawBaseShapePrim(ctx: CanvasRenderingContext2D, prim: BaseShapePrimWithoutStyle): void {
    switch (prim.kind) {
    case "BezierCurve": {
        const { p1, p2, c1, c2 } = prim.curve;

        ctx.moveTo(p1.x, p1.y);
        ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p2.x, p2.y);

        return;
    }
    case "Circle": {
        ctx.arc(prim.pos.x, prim.pos.y, prim.radius, 0, 2*Math.PI);

        return;
    }
    case "CircleSector": {
        const { pos: { x, y }, radius, angles: [a0, a1] } = prim;

        ctx.moveTo(x, y);
        let da = (a1 - a0) % (2*Math.PI);
        if (da < 0)
            da += 2*Math.PI;
        ctx.arc(x, y, radius, a0, a1, da > Math.PI);

        return;
    }
    case "Line": {
        const { p1, p2 } = prim;

        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        return;
    }
    case "Polygon": {
        const { points, closed } = prim;

        if (points.length === 0)
            return;

        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++)
            ctx.lineTo(points[i].x, points[i].y);
        if (closed ?? true)
            ctx.lineTo(points[0].x, points[0].y);

        return;
    }
    case "QuadCurve": {
        const { p1, p2, c } = prim.curve;

        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(c.x, c.y, p2.x, p2.y);

        return;
    }
    case "Rectangle": {
        const size = prim.transform.scale;
        ctx.rect(-size.x/2, -size.y/2, size.x, size.y);
    }
    }
}

export class PrimRenderer {
    private readonly svgMap: Map<string, SVGDrawing>;

    public constructor(svgMap: Map<string, SVGDrawing>) {
        this.svgMap = svgMap;
    }

    public render(ctx: CanvasRenderingContext2D, prim: Prim, debugOptions?: DebugOptions): void {
        switch (prim.kind) {
        case "BezierCurve":
        case "Circle":
        case "CircleSector":
        case "Line":
        case "Polygon":
        case "QuadCurve":
        case "Rectangle":
        case "Group": {
            // Set style
            if (prim.style.fill !== undefined) {
                if (typeof prim.style.fill === "string") {
                    ctx.fillStyle = prim.style.fill;
                } else {
                    // Gradient info
                    // TODO - evaluate performance of this and if it's too much, find a way to cache the gradient
                    const { pos1, radius1, pos2, radius2, colorStops } = prim.style.fill;
                    const gradient = ctx.createRadialGradient(pos1.x, pos1.y, radius1, pos2.x, pos2.y, radius2);
                    colorStops.forEach(([offset, color]) =>
                        gradient.addColorStop(offset, color));
                    ctx.fillStyle = gradient;
                }
            }
            if (prim.style.stroke !== undefined) {
                ctx.strokeStyle = prim.style.stroke.color;
                ctx.lineWidth = prim.style.stroke.size;
                if (prim.style.stroke.lineCap !== undefined)
                    ctx.lineCap = prim.style.stroke.lineCap;
                if (prim.style.stroke.lineJoin !== undefined)
                    ctx.lineJoin = prim.style.stroke.lineJoin;
            }
            if (prim.style.alpha !== undefined)
                ctx.globalAlpha = prim.style.alpha;

            ctx.save();

            // TODO[]: See if we can get around this
            if (prim.kind === "Rectangle") {
                // Get transform without scale, otherwise it will scale borders and other things
                const [a,b,c,d,e,f] = prim.transform.withoutScale().matrix.mat;
                ctx.transform(a,b,c,d,e,f);
            }

            ctx.beginPath();

            if (prim.kind === "Group") {
                // TODO: this won't work for Rectangle atm
                prim.prims.forEach((p) => DrawBaseShapePrim(ctx, p));
            } else {
                DrawBaseShapePrim(ctx, prim);
            }

            if (prim.style.fill && !debugOptions?.debugPrims)
                ctx.fill();
            if (prim.style.stroke && prim.style.stroke.size > 0)
                ctx.stroke();

            ctx.closePath();

            ctx.restore();

            // Reset alpha if we set it
            if (prim.style.alpha !== undefined)
                ctx.globalAlpha = 1;

            return;
        }
        case "SVG": {
            if (!prim.svg || !this.svgMap.has(prim.svg)) // Don't draw if the image isn't loaded
                return;

            ctx.save();

            // Get transform without scale, otherwise it will scale borders and other things
            const [a,b,c,d,e,f] = prim.transform.withoutScale().matrix.mat;
            ctx.transform(a,b,c,d,e,f);

            const svg = this.svgMap.get(prim.svg)!;
            svg.draw(ctx, 0, 0, prim.transform.scale.x, -prim.transform.scale.y, {
                tint: (prim.tint ? { color: prim.tint } : undefined),
                fill: (debugOptions?.debugPrims ? "none" : undefined),
            });

            ctx.restore();

            return;
        }
        case "Text": {
            const { contents, pos, fontStyle, angle, offset } = prim;
            const { font, textBaseline, textAlign, color, scale } = fontStyle;

            ctx.save();
            ctx.font = font;
            ctx.textBaseline = textBaseline;
            ctx.textAlign = textAlign;
            ctx.fillStyle = color;
            ctx.translate(pos.x, pos.y);
            ctx.rotate(angle);
            // Flip y-axis and scale down
            ctx.scale(1/scale, -1/scale);
            // offset is after angle because we want the text to rotate around the center of the component and
            // offset shifts the text away from the center
            ctx.fillText(contents, offset ? offset.x*scale : 0, offset ? offset.y*scale : 0);
            ctx.restore();

            break;
        }
        }
    }
}
