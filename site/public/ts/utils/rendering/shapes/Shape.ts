import {Vector} from "../../math/Vector";

export abstract class Shape {
    protected pos: Vector;

    protected constructor(pos: Vector) {
        this.pos = pos;
    }

    public abstract draw(ctx: CanvasRenderingContext2D): void;

}
