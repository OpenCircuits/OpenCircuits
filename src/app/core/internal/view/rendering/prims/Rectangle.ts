import {Transform} from "math/Transform";

import {Style}         from "../Style";
import {BaseShapePrim} from "./BaseShapePrim";


/**
 * A representation of a Rectangle shape.
 */
export class Rectangle extends BaseShapePrim {
    protected transform: Transform;

    public constructor(transform: Transform, style: Style) {
        super(style);

        this.transform = transform;
    }

    protected override prePath(ctx: CanvasRenderingContext2D): void {
        // Transform
        const [a,b,c,d,e,f] = this.transform.getMatrix().mat;
        ctx.transform(a,b,c,d,e,f);
    }

    public override renderShape(ctx: CanvasRenderingContext2D): void {
        const size = this.transform.getSize();
        console.log(size);
        ctx.rect(-size.x/2, -size.y/2, size.x, size.y);
    }
}
