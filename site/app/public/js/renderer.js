class Renderer {
    constructor(parent, canvas, vw, vh) {
        this.parent = parent;
        this.canvas = canvas;
        this.tintCanvas = document.createElement("canvas");
        this.vw = (vw == undefined ? 1 : vw);
        this.vh = (vh == undefined ? 1 : vh);

        this.context = this.canvas.getContext("2d");

        this.tintCanvas.width = 100;
        this.tintCanvas.height = 100;
        this.tintContext = this.tintCanvas.getContext("2d");
    }
    getCamera() {
        return this.parent.camera;
    }
    setCursor(cursor) {
        this.canvas.style.cursor = cursor;
    }
    resize() {
        this.canvas.width = window.innerWidth * this.vw;
        this.canvas.height = window.innerHeight * this.vh;
    }
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    save() {
        this.context.save();
    }
    restore() {
        this.context.restore();
    }
    translate(v) {
        this.context.translate(v.x, v.y);
    }
    scale(s) {
        this.context.scale(s.x, s.y);
    }
    rotate(a) {
        this.context.rotate(a);
    }
    rect(x, y, w, h, fillStyle, borderStyle, borderSize, alpha) {
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
    circle(x, y, r, fillStyle, borderStyle, borderSize, alpha) {
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
    image(img, x, y, w, h, tint) {
        this.context.drawImage(img, x - w/2, y - h/2, w, h);
        if (tint != undefined)
            this.tintImage(img, x, y, w, h, tint);
    }
    tintImage(img, x, y, w, h, tint) {
        this.tintContext.clearRect(0, 0, this.tintCanvas.width, this.tintCanvas.height);
        this.tintContext.fillStyle = tint;
        this.tintContext.fillRect(0, 0, this.tintCanvas.width, this.tintCanvas.height);
        if (browser.name !== "Firefox")
            this.tintContext.globalCompositeOperation = "destination-atop";
        else
            this.tintContext.globalCompositeOperation = "source-atop";
        this.tintContext.drawImage(img, 0, 0, this.tintCanvas.width, this.tintCanvas.height);

        this.context.globalAlpha = 0.5;
        this.context.drawImage(this.tintCanvas, x - w/2, y - h/2, w, h);
        this.context.globalAlpha = 1.0;
    }
    text(txt, x, y, w, h, textAlign) {
        this.save();
        this.context.font = "lighter 15px arial";
        this.context.fillStyle = '#000';
        this.context.textAlign = textAlign;
        this.context.textBaseline = "middle";
        this.context.fillText(txt, x, y);
        this.restore();
    }
    getTextWidth(txt) {
        var width = 0;
        this.save();
        this.context.font = "lighter 15px arial";
        this.context.fillStyle = '#000';
        this.context.textBaseline = "middle";
        width = this.context.measureText(txt).width;
        this.restore();
        return width;
    }
    line(x1, y1, x2, y2, style, size) {
        this.save();
        this.setStyles(undefined, style, size);
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
        this.context.closePath();
        this.restore();
    }
    _line(x1, y1, x2, y2) {
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
    }
    curve(x1, y1, x2, y2, cx1, cy1, cx2, cy2, style, size) {
        this.save();
        this.setStyles(undefined, style, size);
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
        this.context.stroke();
        this.context.closePath();
        this.restore();
    }
    quadCurve(x1, y1, x2, y2, cx, cy, style, size) {
        this.save();
        this.setStyles(undefined, style, size);
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.quadraticCurveTo(cx, cy, x2, y2);
        this.context.stroke();
        this.context.closePath();
        this.restore();
    }
    shape(points, fillStyle, borderStyle, borderSize) {
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
    setStyles(fillStyle, borderStyle, borderSize, alpha) {
        if (alpha != undefined && alpha !== this.context.globalAlpha)
            this.context.globalAlpha = alpha;

        fillStyle = (fillStyle == undefined) ? ('#ffffff') : (fillStyle);
        if (fillStyle != undefined && fillStyle !== this.context.fillStyle)
            this.context.fillStyle = fillStyle;

        borderStyle = (borderStyle == undefined) ? ('#000000') : (borderStyle);
        if (borderStyle != undefined && borderStyle !== this.context.strokeStyle)
            this.context.strokeStyle = borderStyle;

        borderSize = (borderSize == undefined) ? (2) : (borderSize);
        if (borderSize != undefined && borderSize !== this.context.lineWidth)
            this.context.lineWidth = borderSize;
    }
}
