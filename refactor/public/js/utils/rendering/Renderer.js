// @flow
var Vector = require("../math/Vector");
var V = Vector.V;
var Transform = require("../math/Transform");
var Browser = require("../Browser");
var Camera = require("../Camera");

class Renderer {
    canvas: HTMLCanvasElement;
    tintCanvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    tintContext: CanvasRenderingContext2D;
    
    vw: number;
    vh: number;
    
    constructor(canvas: HTMLCanvasElement, vw: number = 1.0, vh: number = 1.0): void {
        this.canvas = canvas;
        this.tintCanvas = document.createElement("canvas");
        this.vw = vw;
        this.vh = vh;

        this.context = this.canvas.getContext("2d");

        this.tintCanvas.width = 100;
        this.tintCanvas.height = 100;
        this.tintContext = this.tintCanvas.getContext("2d");
    }
    setCursor(cursor: string): void {
        this.canvas.style.cursor = cursor;
    }
    resize(): void {
        this.canvas.width = window.innerWidth * this.vw;
        this.canvas.height = window.innerHeight * this.vh;
    }
    clear(): void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    save(): void {
        this.context.save();
    }
    restore(): void {
        this.context.restore();
    }
    transform(camera: Camera, transform: Transform) {
        var m = transform.getMatrix().copy();
        var v = camera.getScreenPos(V(m.mat[4], m.mat[5]));
        m.mat[4] = v.x, m.mat[5] = v.y;
        m.scale(V(1/camera.zoom, 1/camera.zoom));
        this.context.setTransform(m.mat[0], m.mat[1], m.mat[2], m.mat[3], m.mat[4], m.mat[5]);
    }
    translate(v: Vector): void {
        this.context.translate(v.x, v.y);
    }
    scale(s: Vector): void {
        this.context.scale(s.x, s.y);
    }
    rotate(a: number): void {
        this.context.rotate(a);
    }
    rect(x: number, y: number, w: number, h: number, 
        fillStyle: string, borderStyle: string, 
        borderSize: number, alpha: ?number): void {
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
    circle(x: number, y: number, r: number, 
        fillStyle: string, borderStyle: string, 
        borderSize: number, alpha: ?number): void {
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
    image(img: Image, x: number, y: number, w: number, h: number, tint: ?string): void {
        this.context.drawImage(img, x - w/2, y - h/2, w, h);
        if (tint != undefined)
            this.tintImage(img, x, y, w, h, tint);
    }
    tintImage(img: Image, x: number, y: number, w: number, h: number, tint: string): void {
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
    text(txt: string, x: number, y: number, w: number, h: number, textAlign: string): void {
        this.save();
        this.context.font = "lighter 15px arial";
        this.context.fillStyle = '#000';
        this.context.textAlign = textAlign;
        this.context.textBaseline = "middle";
        this.context.fillText(txt, x, y);
        this.restore();
    }
    getTextWidth(txt: string): number {
        var width = 0;
        this.save();
        this.context.font = "lighter 15px arial";
        this.context.fillStyle = '#000';
        this.context.textBaseline = "middle";
        width = this.context.measureText(txt).width;
        this.restore();
        return width;
    }
    line(x1: number, y1: number, x2: number, y2: number, style: string, size: number): void {
        this.save();
        this.setStyles(undefined, style, size);
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
        this.context.closePath();
        this.restore();
    }
    _line(x1: number, y1: number, x2: number, y2: number): void {
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
    }
    curve(x1: number, y1: number, x2: number, y2: number, 
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
    quadCurve(x1: number, y1: number, x2: number, y2: number,
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
    shape(points: Array<Vector>, fillStyle: string, borderStyle: string, borderSize: number): void {
        this.save();
        this.setStyles(fillStyle, borderStyle, borderSize);
        this.context.beginPath();
        this.context.moveTo(points[0].x, points[0].y);
        for (var i = 1; i < points.length; i++)
            this.context.lineTo(points[i].x, points[i].y);
        this.context.lineTo(points[0].x, points[0].y);
        this.context.fill();
        this.context.closePath();
        if (borderSize > 0)
            this.context.stroke();
        this.restore();
    }
    setStyles(fillStyle: string = '#ffffff', borderStyle: string = '#000000', 
              borderSize: number = 2, alpha: ?number): void {
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

module.exports = Renderer;