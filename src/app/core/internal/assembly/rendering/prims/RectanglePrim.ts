import {Transform} from "math/Transform";

import {Style}         from "../Style";
import {BaseShapePrim} from "./BaseShapePrim";


/**
 * A representation of a Rectangle shape.
 */
export class RectanglePrim extends BaseShapePrim {
    // TODO[model_refactor](leon) - need to move away from Transforms representing rectangles and having sizes
    protected transform: Transform;

    /**
     * Constructor for a rectangle primitive.
     *
     * @param transform The transform that represents the rectangle.
     * @param style     The draw-style for the rectangle.
     */
    public constructor(transform: Transform, style: Style) {
        super(style);

        this.transform = transform;
    }

    protected override prePath(ctx: CanvasRenderingContext2D): void {
        // Transform
        const [a,b,c,d,e,f] = this.transform.getMatrix().mat;
        ctx.transform(a,b,c,d,e,f);
    }

    protected override renderShape(ctx: CanvasRenderingContext2D): void {
        const size = this.transform.getSize();
        ctx.rect(-size.x/2, -size.y/2, size.x, size.y);
    }
}
