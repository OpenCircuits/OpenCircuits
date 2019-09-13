import {Vector} from "Vector";

import {Circle} from "./Circle";

export class ArcCircle extends Circle {
    protected a0: number = 0;
    protected a1: number = 2*Math.PI;

    public constructor(pos: Vector, radius: number, a0: number, a1: number) {
        super(pos, radius);
        this.a0 = a0;
        this.a1 = a1;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.moveTo(this.pos.x, this.pos.y);
        let da = (this.a1 - this.a0) % (2*Math.PI);
        if (da < 0) da += 2*Math.PI;
        ctx.arc(this.pos.x, this.pos.y, this.radius, this.a0, this.a1, da > Math.PI);
    }

}
