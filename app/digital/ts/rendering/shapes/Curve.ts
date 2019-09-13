import {Vector} from "Vector";
import {BezierCurve} from "math/BezierCurve";

import {Shape} from "./Shape";

export class Curve implements Shape {
    protected curve: BezierCurve;

    public constructor(curve: BezierCurve);
    public constructor(p1: Vector, p2: Vector, c1: Vector, c2: Vector);
    public constructor(p1: Vector | BezierCurve, p2?: Vector, c1?: Vector, c2?: Vector) {
        if (p1 instanceof BezierCurve)
            this.curve = p1;
        else
            this.curve = new BezierCurve(p1, p2, c1, c2);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const p1 = this.curve.getP1();
        const p2 = this.curve.getP2();
        const c1 = this.curve.getC1();
        const c2 = this.curve.getC2();

        ctx.moveTo(p1.x, p1.y);
        ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p2.x, p2.y);
    }

}
