import {Vector} from "Vector";

import {Style}         from "../Style";
import {BaseShapePrim} from "./BaseShapePrim";


/**
 * A representation of a Polygon shape.
 */
export class PolygonPrim extends BaseShapePrim {
    protected points: Vector[];

    /**
     * Constructor for Polygon.
     *
     * @param points The list of vertices for the polygon.
     * @param style  The draw-style for the polygon.
     */
    public constructor(points: Vector[], style: Style) {
        super(style);

        this.points = points;
    }

    protected override renderShape(ctx: CanvasRenderingContext2D): void {
        const { points } = this;

        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < this.points.length; i++)
            ctx.lineTo(points[i].x, points[i].y);
        ctx.lineTo(points[0].x, points[0].y);
    }
}
