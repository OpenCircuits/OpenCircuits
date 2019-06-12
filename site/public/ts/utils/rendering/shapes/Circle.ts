import {Vector} from "../../math/Vector";

import {Shape} from "./Shape";

export class Circle extends Shape {
    protected radius: number;

    protected a0: number = 0;
    protected a1: number = 2*Math.PI;

    public constructor(pos: Vector, radius: number) {
        super(pos);

        this.radius = radius;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.arc(this.pos.x, this.pos.y, this.radius, this.a0, this.a1);
    }

    public arc(a0: number, a1: number): Circle {
        this.a0 = a0;
        this.a1 = a1;
        return this;
    }

}
