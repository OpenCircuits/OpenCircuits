import {Vector,V} from "../math/Vector";
import {Transform} from "../math/Transform";
import {Browser} from "../Browser";
import {Camera} from "../Camera";

export class Renderer {
    private canvas: HTMLCanvasElement;
    private tintCanvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private tintContext: CanvasRenderingContext2D;

    private vw: number;
    private vh: number;

    constructor(canvas: HTMLCanvasElement, vw: number = 1.0, vh: number = 1.0) {
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
    public transform(camera: Camera, transform: Transform) {
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
    public rect(x: number, y: number, w: number, h: number,
        fillStyle: string, borderStyle: string,
        borderSize: number, alpha?: number): void {
        this.save();
        this.setStyles(fillStyle, borderStyle, borderSize, alpha);
        this.context.beginPath();
        this.context.rect(x - w/2, y - h/2, w, h);
        this.context.fill();
        if (borderSize > 0 || borderSize == undefined)
            this.context.stroke();
        this.context.closePath();
        this.restore();
    }
    public circle(x: number, y: number, r: number,
        fillStyle: string, borderStyle: string,
        borderSize: number, alpha?: number): void {
        this.save();
        this.setStyles(fillStyle, borderStyle, borderSize, alpha);
        this.context.beginPath();
        this.context.arc(x, y, r, 0, 2*Math.PI);
        if (fillStyle != undefined)
            this.context.fill();
        if (borderSize > 0 || borderSize == undefined)
            this.context.stroke();
        this.context.closePath();
        this.restore();
    }
    public arcCircle(x: number, y: number, r: number, a0: number, a1: number,
        fillStyle: string, borderStyle: string,
        borderSize: number, alpha?: number): void {
        this.save();
        this.setStyles(fillStyle, borderStyle, borderSize, alpha);
        this.context.beginPath();
        this.context.moveTo(x, y);
        let da = (a1 - a0) % (2*Math.PI);
        if (da < 0) da += 2*Math.PI;
        this.context.arc(x, y, r, a0, a1, da > Math.PI);
        if (fillStyle != undefined)
            this.context.fill();
        this.context.closePath();
        this.restore();
    }
    public image(img: HTMLImageElement, x: number, y: number, w: number, h: number, tint?: string): void {
        this.context.drawImage(img, x - w/2, y - h/2, w, h);
        if (tint != undefined)
            this.tintImage(img, x, y, w, h, tint);
    }
    public tintImage(img: HTMLImageElement, x: number, y: number, w: number, h: number, tint: string): void {
        this.tintContext.clearRect(0, 0, this.tintCanvas.width, this.tintCanvas.height);
        this.tintContext.fillStyle = tint;
        this.tintContext.fillRect(0, 0, this.tintCanvas.width, this.tintCanvas.height);
        if (Browser.name !== "Firefox")
            this.tintContext.globalCompositeOperation = "destination-atop";
        else
            this.tintContext.globalCompositeOperation = "source-atop";
        this.tintContext.drawImage(img, 0, 0, this.tintCanvas.width, this.tintCanvas.height);
        this.context.globalAlpha = 0.5;
        this.context.drawImage(this.tintCanvas, x - w/2, y - h/2, w, h);
        this.context.globalAlpha = 1.0;
    }
    public text(txt: string, x: number, y: number, textAlign: CanvasTextAlign): void {
        this.save();
        this.context.font = "lighter 15px arial";
        this.context.fillStyle = '#000';
        this.context.textAlign = textAlign;
        this.context.textBaseline = "middle";
        this.context.fillText(txt, x, y);
        this.restore();
    }
    public getTextWidth(txt: string): number {
        let width = 0;
        this.save();
        this.context.font = "lighter 15px arial";
        this.context.fillStyle = '#000';
        this.context.textBaseline = "middle";
        width = this.context.measureText(txt).width;
        this.restore();
        return width;
    }
    public line(x1: number, y1: number, x2: number, y2: number, style: string, size: number): void {
        this.save();
        this.setStyles(undefined, style, size);
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
        this.context.closePath();
        this.restore();
    }
    public pathLine(x1: number, y1: number, x2: number, y2: number): void {
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
    }
    public curve(x1: number, y1: number, x2: number, y2: number,
          cx1: number, cy1: number, cx2: number, cy2: number,
          style: string, size: number): void {
        this.save();
        this.setStyles(undefined, style, size);
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
        this.context.stroke();
        this.context.closePath();
        this.restore();
    }
    public quadCurve(x1: number, y1: number, x2: number, y2: number,
              cx: number, cy: number, style: string, size: number): void {
        this.save();
        this.setStyles(undefined, style, size);
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.quadraticCurveTo(cx, cy, x2, y2);
        this.context.stroke();
        this.context.closePath();
        this.restore();
    }
    public shape(points: Array<Vector>, fillStyle: string, borderStyle: string, borderSize: number): void {
        this.save();
        this.setStyles(fillStyle, borderStyle, borderSize);
        this.context.beginPath();
        this.context.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++)
            this.context.lineTo(points[i].x, points[i].y);
        this.context.lineTo(points[0].x, points[0].y);
        this.context.fill();
        this.context.closePath();
        if (borderSize > 0)
            this.context.stroke();
        this.restore();
    }
    public setStyles(fillStyle: string = '#ffffff', borderStyle: string = '#000000',
              borderSize: number = 2, alpha?: number): void {
        if (alpha != undefined && alpha !== this.context.globalAlpha)
            this.context.globalAlpha = alpha;

        if (fillStyle !== this.context.fillStyle)
            this.context.fillStyle = fillStyle;

        if (borderStyle !== this.context.strokeStyle)
            this.context.strokeStyle = borderStyle;

        if (borderSize !== this.context.lineWidth)
            this.context.lineWidth = borderSize;
    }
}
