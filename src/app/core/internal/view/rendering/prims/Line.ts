import {Vector} from "Vector";

import {Camera} from "core/schema/Camera";

import {Prim}          from "../../Prim";
import {Stroke, Style} from "../Style";


/**
 * A representation of a Line shape.
 */
export class Line implements Prim {
    protected readonly p1: Vector;
    protected readonly p2: Vector;
    protected stroke: Stroke;

    /**
     * Constructor for Line.
     *
     * @param p1     The start point.
     * @param p2     The end point.
     * @param stroke The stroke style for the line.
     */
    public constructor(p1: Vector, p2: Vector, stroke: Stroke) {
        this.p1 = p1;
        this.p2 = p2;
        this.stroke = stroke;
    }

    public cull(camera: Camera): boolean {
        throw new Error("Method not implemented.");
    }
    public hitTest(pt: Vector): boolean {
        throw new Error("Method not implemented.");
    }
    public render(ctx: CanvasRenderingContext2D): void {
        // Set style
        ctx.strokeStyle = this.stroke.color;
        ctx.lineWidth = this.stroke.width;

        ctx.beginPath();

        // Draw line
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);

        ctx.stroke();

        ctx.closePath();
    }
    public updateStyle(style: Style): void {
        this.stroke.color = style.strokeColor!;
        this.stroke.width = style.strokeSize!;
    }
}
