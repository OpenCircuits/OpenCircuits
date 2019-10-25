import {Vector} from "Vector";

import {Shape} from "./Shape";

export class Circle implements Shape {
    protected pos: Vector;
    protected radius: number;

    public constructor(pos: Vector, radius: number) {
        this.pos = pos;
        this.radius = radius;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2*Math.PI);
    }

}
