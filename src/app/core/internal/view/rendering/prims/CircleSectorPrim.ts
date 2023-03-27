import {Vector} from "Vector";

import {Style}         from "../Style";
import {BaseShapePrim} from "./BaseShapePrim";


/**
 * A representation of an Circular Sector shape.
 *
 * A Circular Sector is a sector of a circle through two given angles.
 *
 * i.e. Drawing a half-circle or quarter-circle.
 *
 * See: https://en.wikipedia.org/wiki/Circular_sector.
 */
export class CircleSectorPrim extends BaseShapePrim {
    protected pos: Vector;
    protected radius: number;
    protected angles: [number, number];

    /**
     * Constructor for a circular sector primitive.
     *
     * @param pos    The position of the center of the sector.
     * @param radius The radius of the sector.
     * @param angles The starting and ending angles of the sector.
     * @param style  The draw-style for the sector.
     */
    public constructor(pos: Vector, radius: number, angles: [number, number] = [0, 2*Math.PI], style: Style) {
        super(style);

        this.pos = pos;
        this.radius = radius;
        this.angles = [...angles];
    }

    protected override renderShape(ctx: CanvasRenderingContext2D): void {
        const { pos: { x, y }, radius, angles: [a0, a1] } = this;

        ctx.moveTo(x, y);
        let da = (a1 - a0) % (2*Math.PI);
        if (da < 0)
            da += 2*Math.PI;
        // Flip angles since y-axis is flipped
        ctx.arc(x, y, radius, 2*Math.PI - a0, 2*Math.PI - a1, da <= Math.PI);
    }
}
