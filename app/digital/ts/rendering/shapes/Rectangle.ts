import {Vector} from "Vector";
import {Transform} from "math/Transform";

import {Shape} from "./Shape";

export class Rectangle implements Shape {
    protected pos: Vector;
    protected size: Vector;

    public constructor(transform: Transform);
    public constructor(pos: Vector, size: Vector);
    public constructor(pos: Vector | Transform, size?: Vector) {
        if (pos instanceof Transform) {
            this.pos  = pos.getPos();
            this.size = pos.getSize();
        } else {
            this.pos  = pos;
            this.size = size;
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const center = this.pos.sub(this.size.scale(0.5));

        ctx.rect(center.x, center.y, this.size.x, this.size.y);
    }

}
