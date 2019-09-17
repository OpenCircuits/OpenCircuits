import {Vector} from "Vector";

import {Shape} from "./Shape";

export class Line implements Shape {
    protected p1: Vector;
    protected p2: Vector;

    public constructor(p1: Vector, p2: Vector) {
        this.p1 = p1;
        this.p2 = p2;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
    }

}
