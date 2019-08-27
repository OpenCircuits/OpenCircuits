import {FONT} from "./Styles";

import {Vector,V} from "../math/Vector";
import {Transform} from "../math/Transform";

import {Browser} from "../Browser";
import {Camera} from "../Camera";

import {Style} from "./Style";

import {Shape} from "./shapes/Shape";

export class Renderer {
    private canvas: HTMLCanvasElement;
    private tintCanvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private tintContext: CanvasRenderingContext2D;

    private vw: number;
    private vh: number;

    public constructor(canvas: HTMLCanvasElement, vw: number = 1.0, vh: number = 1.0) {
        this.canvas = canvas;
        this.tintCanvas = document.createElement("canvas");
        this.vw = vw;
        this.vh = vh;

        this.context = this.canvas.getContext("2d");

        this.tintCanvas.width = 100;
        this.tintCanvas.height = 100;
        this.tintContext = this.tintCanvas.getContext("2d");
    }
    public setCursor(cursor: string): void {
        this.canvas.style.cursor = cursor;
    }
    public getSize(): Vector {
        return V(this.canvas.width, this.canvas.height);
    }
    public resize(): void {
        this.canvas.width = window.innerWidth * this.vw;
        this.canvas.height = window.innerHeight * this.vh;
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
    public image(img: HTMLImageElement, pos: Vector, size: Vector, tint?: string): void {
        const center = pos.sub(size.scale(0.5));

        this.context.drawImage(img, center.x, center.y, size.x, size.y);
        if (tint != undefined)
            this.tintImage(img, pos, size, tint);
    }
    public tintImage(img: HTMLImageElement, pos: Vector, size: Vector, tint: string): void {
        const center = pos.sub(size.scale(0.5));

        // Draw to tint canvas
        this.tintContext.clearRect(0, 0, this.tintCanvas.width, this.tintCanvas.height);
        this.tintContext.fillStyle = tint;
        this.tintContext.fillRect(0, 0, this.tintCanvas.width, this.tintCanvas.height);
        if (Browser.name !== "Firefox")
            this.tintContext.globalCompositeOperation = "destination-atop";
        else
            this.tintContext.globalCompositeOperation = "source-atop";
        this.tintContext.drawImage(img, 0, 0, this.tintCanvas.width, this.tintCanvas.height);

        // Draw to main canvas
        this.context.globalAlpha = 0.5;
        this.context.drawImage(this.tintCanvas, center.x, center.y, size.x, size.y);
        this.context.globalAlpha = 1.0;
    }
    public text(txt: string, pos: Vector, textAlign: CanvasTextAlign): void {
        this.save();
        this.context.font = FONT;
        this.context.fillStyle = "#000";
        this.context.textAlign = textAlign;
        this.context.textBaseline = "middle";
        this.context.fillText(txt, pos.x, pos.y);
        this.restore();
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
