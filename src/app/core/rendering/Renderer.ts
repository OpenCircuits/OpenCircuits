import {parseColor, SVGDrawing} from "svg2canvas";

import {Vector,V} from "Vector";
import {Transform} from "math/Transform";
import {Camera} from "math/Camera";

import {FONT} from "./Styles";
import {Style} from "./Style";

import {Shape} from "./shapes/Shape";


export class Renderer {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    public constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
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
        const m = transform.getMatrix().copy();
        m.setTranslation(camera.getScreenPos(m.getTranslation()));
        m.scale(1.0/camera.getZoom());
        this.context.setTransform(m.get(0), m.get(1), m.get(2),
                                  m.get(3), m.get(4), m.get(5));
    }
    public translate(v: Vector): void {
        this.context.translate(v.x, v.y);
    }
    public scale(s: Vector): void {
        this.context.scale(s.x, s.y);
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
    public draw(shape: Shape, style: Style, alpha: number = 1): void {
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
    public image(img: SVGDrawing, center: Vector, size: Vector, tint?: string): void {
        const pos = center.sub(size.scale(0.5));
        const col = (tint ? parseColor(tint) : undefined);

        img.draw(this.context, pos.x, pos.y, size.x, size.y, col);
    }

    public text(txt: string, pos: Vector, textAlign: CanvasTextAlign, color: string = "#000"): void {
        this.save();
        this.context.font = FONT;
        this.context.fillStyle = color;
        this.context.textAlign = textAlign;
        this.context.textBaseline = "middle";
        this.context.fillText(txt, pos.x, pos.y);
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
    public pathLine(p1: Vector, p2: Vector): void {
        this.context.moveTo(p1.x, p1.y);
        this.context.lineTo(p2.x, p2.y);
    }
    public setStyle(style: Style, alpha: number = 1): void {
        // Set styles but only change them if they're different for optimization purposes
        if (alpha !== this.context.globalAlpha)
            this.context.globalAlpha = alpha;

        if (style.fillColor !== this.context.fillStyle)
            this.context.fillStyle = style.fillColor;
        if (style.borderColor !== this.context.strokeStyle)
            this.context.strokeStyle = style.borderColor;
        if (style.borderSize !== this.context.lineWidth)
            this.context.lineWidth = style.borderSize;
    }
}
