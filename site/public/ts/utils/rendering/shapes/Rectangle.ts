import {Vector} from "../../math/Vector";
import {Transform} from "../../math/Transform";

import {Shape} from "./Shape";

export class Rectangle extends Shape {
    protected size: Vector;

    public constructor(transform: Transform);
    public constructor(pos: Vector, size: Vector);
    public constructor(pos: Vector | Transform, size?: Vector) {
        super((pos instanceof Vector) ? (pos) : (pos.getPos()));

        this.size = (pos instanceof Transform) ? (pos.getSize()) : (size);
    }

    public draw(ctx: CanvasRenderingContext2D) {
        const center = this.pos.sub(this.size.scale(0.5));

        ctx.rect(center.x, center.y, this.size.x, this.size.y);
    }

}
