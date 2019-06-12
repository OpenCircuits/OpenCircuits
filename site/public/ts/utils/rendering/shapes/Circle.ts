import {Vector} from "../../math/Vector";

import {Shape} from "./Shape";

export class Circle extends Shape {
    protected radius: number;

    public constructor(pos: Vector, radius: number) {
        super(pos);

        this.radius = radius;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2*Math.PI);
    }

}
