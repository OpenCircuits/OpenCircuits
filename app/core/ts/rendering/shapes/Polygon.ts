import {Vector} from "Vector";

import {Shape} from "./Shape";

export class Polygon implements Shape {
    protected points: Array<Vector>;

    public constructor(points: Array<Vector>) {
        this.points = points;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++)
            ctx.lineTo(this.points[i].x, this.points[i].y);
        ctx.lineTo(this.points[0].x, this.points[0].y);
    }

}
