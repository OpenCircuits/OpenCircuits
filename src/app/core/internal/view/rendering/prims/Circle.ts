import {Schema}                   from "core/schema";
import {Vector}                   from "Vector";
import {Prim}                     from "../../Prim";
import {FillStyle, Stroke, Style} from "../Style";


/**
 * A representation of a Circle shape.
 */
export class Circle implements Prim {
    protected pos: Vector;
    protected radius: number;
    protected stroke: Stroke;
    protected fillStyle: FillStyle;

    /**
     * Constructor for Circle.
     *
     * @param pos       The position.
     * @param radius    The radius.
     * @param stroke    The stroke style for the circle.
     * @param fillStyle The fill color for the circle.
     */
    public constructor(pos: Vector, radius: number, stroke: Stroke, fillStyle: FillStyle) {
        this.pos = pos;
        this.radius = radius;
        this.stroke = stroke;
        this.fillStyle = fillStyle;
    }

    public cull(camera: Schema.Camera): boolean {
        throw new Error("Method not implemented.");
    }
    public hitTest(pt: Vector): boolean {
        throw new Error("Method not implemented.");
    }

    /**
     * Draws the Circle on the canvas.
     *
     * @param ctx Provides the 2D rendering context for the drawing surface of an element.
     */
    public render(ctx: CanvasRenderingContext2D): void {
        // Set style
        ctx.strokeStyle = this.stroke.color;
        ctx.lineWidth = this.stroke.width;
        ctx.fillStyle = this.fillStyle;

        ctx.beginPath();

        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2*Math.PI);

        ctx.fill();
        ctx.stroke();

        ctx.closePath();
    }
    public updateStyle(style: Style): void {
        this.stroke.color = style.strokeColor!;
        this.stroke.width = style.strokeSize!;
        this.fillStyle = style.fillColor! as string;
    }

}
