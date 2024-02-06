import {SVGDrawing, parseColor} from "svg2canvas";

import {V, Vector} from "Vector";

import {Camera}    from "math/Camera";
import {Transform} from "math/Transform";

import {Shape} from "./shapes/Shape";
import {Style} from "./Style";
import {FONT}  from "./Styles";


export class Renderer {
    private readonly canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    public constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d")!;
    }
    public setCursor(cursor: string): void {
        this.canvas.style.cursor = cursor;
    }
    public getSize(): Vector {
        return V(this.canvas.width, this.canvas.height);
    }
    public clear(): void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    public save(): void {
        this.context.save();
    }
    public restore(): void {
        this.context.restore();
    }
    public transform(camera: Camera, transform: Transform): void {
        const m = camera.getInverseMatrix().mult(transform.getMatrix());
        this.context.setTransform(
            m.get(0), m.get(1),
            m.get(2), m.get(3),
            // Shift over to the center
            m.get(4) + camera.getCenter().x, m.get(5) + camera.getCenter().y
        );
    }
    public translate(v: Vector): void {
        this.context.translate(v.x, v.y);
    }
    public rotate(a: number): void {
        this.context.rotate(a);
    }
    public beginPath(): void {
        this.context.beginPath();
    }
    public closePath(): void {
        this.context.closePath();
    }
    public stroke(): void {
        this.context.stroke();
    }
    public draw(shape: Shape, style: Style, alpha = 1): void {
        this.save();
        this.setStyle(style, alpha);

        // Begin path and draw the shape
        this.context.beginPath();
        shape.draw(this.context);

        // Only fill or stroke if we have to
        if (style.fill())
            this.context.fill();
        if (style.stroke())
            this.context.stroke();

        this.context.closePath();
        this.restore();
    }
    public image(img: SVGDrawing, pos: Vector, size: Vector, tint?: string): void {
        const col = (tint ? parseColor(tint) : undefined);

        // Flip y-axis scale
        img.draw(this.context, pos.x, pos.y, size.x, -size.y, col);
    }

    public text(txt: string, pos: Vector, textAlign: CanvasTextAlign,
                color = "#000", font = FONT, textBaseline: CanvasTextBaseline = "middle", angle = 0): void {
        this.save();
        this.context.font = font;
        this.context.fillStyle = color;
        this.context.textAlign = textAlign;
        this.context.textBaseline = textBaseline;

        this.translate(pos);
        // Flip y-axis scale
        this.context.scale(1, -1);
        if (angle !== 0)
            this.rotate(angle);
        this.context.fillText(txt, 0, 0);
        this.restore();
    }

    public createRadialGradient(pos1: Vector, r1: number, pos2: Vector, r2: number): CanvasGradient {
        return this.context.createRadialGradient(pos1.x, pos1.y, r1, pos2.x, pos2.y, r2);
    }

    public getTextWidth(txt: string): number {
        this.context.font = FONT;
        this.context.textBaseline = "middle";
        return this.context.measureText(txt).width;
    }
    public moveTo(p: Vector) {
        this.context.moveTo(p.x, p.y);
    }
    public lineTo(p: Vector) {
        this.context.lineTo(p.x, p.y);
    }
    public lineWith(p: Vector) {
        this.lineTo(p);
        this.moveTo(p);
    }
    public hLine(pos: Vector, len: number, align: "left"|"center") {
        if (align === "center")
            this.pathLine(pos.sub(len/2, 0), pos.add(len/2, 0));
        else
            this.pathLine(pos, pos.add(len, 0));
    }
    public hLines(ys: number[], x0: number, len: number, align: "left"|"center") {
        ys.forEach((y) => this.hLine(V(x0, y), len, align));
    }
    public strokeHLines(...args: Parameters<typeof this.hLines>) {
        this.beginPath();
        this.hLines(...args);
        this.closePath();
        this.stroke();
    }
    public vLine(pos: Vector, len: number, baseline: "bottom"|"middle") {
        if (baseline === "middle")
            this.pathLine(pos.sub(0, len/2), pos.add(0, len/2));
        else
            this.pathLine(pos, pos.add(0, len));
    }
    public vLines(xs: number[], y0: number, len: number, baseline: "bottom"|"middle") {
        xs.forEach((x) => this.vLine(V(x, y0), len, baseline));
    }
    public strokeVLines(...args: Parameters<typeof this.vLines>) {
        this.beginPath();
        this.vLines(...args);
        this.closePath();
        this.stroke();
    }
    public pathLine(p1: Vector, p2: Vector) {
        this.moveTo(p1);
        this.lineTo(p2);
    }
    public strokePath(path: Vector[]) {
        this.beginPath();
        this.moveTo(path[0]);
        for (let s = 0; s < path.length-1; s++)
            this.lineWith(path[s+1]);
        this.closePath();
        this.stroke();
    }
    public setPathStyle(style: Partial<Omit<CanvasPathDrawingStyles, "lineWidth" | "getLineDash" | "setLineDash">>) {
        if (style.lineCap && style.lineCap !== this.context.lineCap)
            this.context.lineCap = style.lineCap;
        if (style.lineDashOffset && style.lineDashOffset !== this.context.lineDashOffset)
            this.context.lineDashOffset = style.lineDashOffset;
        if (style.lineJoin && style.lineJoin !== this.context.lineJoin)
            this.context.lineJoin = style.lineJoin;
        if (style.miterLimit && style.miterLimit !== this.context.miterLimit)
            this.context.miterLimit = style.miterLimit;
    }
    public setStyle(style: Style, alpha = 1): void {
        // Set styles but only change them if they're different for optimization purposes
        if (alpha !== this.context.globalAlpha)
            this.context.globalAlpha = alpha;

        if (style.fillColor && style.fillColor !== this.context.fillStyle)
            this.context.fillStyle = style.fillColor;
        if (style.borderColor && style.borderColor !== this.context.strokeStyle)
            this.context.strokeStyle = style.borderColor;
        if (style.borderSize && style.borderSize !== this.context.lineWidth)
            this.context.lineWidth = style.borderSize;
    }
}
