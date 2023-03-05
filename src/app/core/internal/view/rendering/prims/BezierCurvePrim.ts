import {BezierCurve} from "math/BezierCurve";

import {Style}         from "../Style";
import {BaseShapePrim} from "./BaseShapePrim";


export class BezierCurvePrim extends BaseShapePrim {
    protected curve: BezierCurve;

    public constructor(curve: BezierCurve, style: Style) {
        super(style);

        this.curve = curve;
    }

    protected renderShape(ctx: CanvasRenderingContext2D): void {
        const { p1, p2, c1, c2 } = this.curve;

        ctx.moveTo(p1.x, p1.y);
        ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p2.x, p2.y);
    }
}
