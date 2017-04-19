
const IO_PORT_LENGTH = 60;
const DEFAULT_SIZE = 50;

var frame = {
    // Create canvas
    canvas : document.getElementById("canvas"),
    tintCanvas : document.createElement("canvas"),
    start : function() {
        // Set canvas to be full-screen on the page
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.context = this.canvas.getContext("2d");

        // Setup tint canvas
        this.tintCanvas.width = 1000;
        this.tintCanvas.height = 1000;
        this.tintContext = this.tintCanvas.getContext("2d");

        // Insert the canvas into the page
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);

        // Setup input
        setupInput(this.canvas);

        // Setup resize event
        window.addEventListener('resize', resize, false);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

var camera = {
    pos:new Vector(0, 0),
    zoom:1,
    getScreenPos: function(vec) {
        return vec.sub(this.pos).scale(1.0 / this.zoom).add(frame.canvas.width/2, frame.canvas.height/2);
    },
    getWorldPos: function(vec) {
        return vec.sub(frame.canvas.width/2, frame.canvas.height/2).scale(this.zoom).add(this.pos);
    }
}

function resize(e) {
    frame.canvas.width = window.innerWidth;
    frame.canvas.height = window.innerHeight;

    render();
}

function saveCtx() {
    frame.context.save();
}

function restoreCtx() {
    frame.context.restore();
}

function translateCtx(v) {
    frame.context.translate(v.x, v.y);
}

function scaleCtx(s) {
    frame.context.scale(s.x, s.y);
}

function rotateCtx(a) {
    frame.context.rotate(a);
}

function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
}

function rect(x, y, w, h, tint, bTint, bSize) {
    frame.context.fillStyle = (tint === undefined ? '#fff' : tint);
    frame.context.strokeStyle = (bTint === undefined ? '#000' : bTint);
    frame.context.lineWidth = (bSize === undefined ? 2 : bSize);
    frame.context.fillRect(x-w/2, y-h/2, w, h);
    if (bSize > 0 || bSize === undefined)
        frame.context.strokeRect(x-w/2, y-h/2, w, h);
}

function circle(x, y, r, style, borderStyle, borderSize) {
    frame.context.fillStyle = (style === undefined ? '#fff' : style);
    frame.context.strokeStyle = (borderStyle === undefined ? '#000' : borderStyle);
    frame.context.lineWidth = (borderSize === undefined ? 2 : borderSize);
    frame.context.beginPath();
    frame.context.arc(x, y, r, 0, 2*Math.PI);
    frame.context.fill();
    frame.context.stroke();
    frame.context.closePath();
}

function drawImage(img, x, y, w, h, tint) {
    if (tint === undefined)
        frame.context.drawImage(img, x-w/2, y-h/2, w, h);
    else
        tintDraw(img, x, y, w, h, tint);
}

function drawRotatedImage(img, x, y, w, h, angle, tint) {
    saveCtx();
    var pos = camera.getScreenPos(V(x, y));
    var size = V(w / camera.zoom, h / camera.zoom);
    frame.context.translate(pos.x, pos.y);
    frame.context.rotate(angle);
    if (tint === undefined)
        frame.context.drawImage(img, -size.x/2, -size.y/2, size.x, size.y);
    else
        tintDraw(img, -size.x/2, -size.y/2, size.x, size.y, tint);
    restoreCtx();
}

function tintDraw(img, x, y, w, h, col) {
    frame.tintContext.clearRect(0, 0, frame.tintCanvas.width, frame.tintCanvas.height);
    frame.tintContext.fillStyle = col;
    frame.tintContext.fillRect(0, 0, frame.tintCanvas.width, frame.tintCanvas.height);
    frame.tintContext.globalCompositeOperation = "destination-atop";
    frame.tintContext.drawImage(img, 0, 0, frame.tintCanvas.width, frame.tintCanvas.height);

    frame.context.drawImage(img, x-w/2, y-h/2, w, h);
    frame.context.globalAlpha = 0.5;
    frame.context.drawImage(frame.tintCanvas, x-w/2, y-h/2, w, h);
    frame.context.globalAlpha = 1.0;
}

function strokeCurve(x1, y1, x2, y2, cx1, cy1, cx2, cy2, style, size) {
    frame.context.strokeStyle = (style === undefined ? '#000' : style);
    frame.context.lineWidth = (size === undefined ? 2 : size);
    frame.context.beginPath();
    frame.context.moveTo(x1, y1);
    frame.context.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
    frame.context.stroke();
    frame.context.closePath();
}

function strokeQuadCurve(x1, y1, x2, y2, cx, cy, style, size) {
    frame.context.strokeStyle = (style === undefined ? '#000' : style);
    frame.context.lineWidth = (size === undefined ? 2 : size);
    frame.context.beginPath();
    frame.context.moveTo(x1, y1);
    frame.context.quadraticCurveTo(cx, cy, x2, y2);
    frame.context.stroke();
    frame.context.closePath();
}

function strokeLine(x1, y1, x2, y2, style, size) {
    frame.context.strokeStyle = (style === undefined ? '#000' : style);
    frame.context.lineWidth = (size === undefined ? 2 : size);
    frame.context.beginPath();
    frame.context.moveTo(x1, y1);
    frame.context.lineTo(x2, y2);
    frame.context.stroke();
    frame.context.closePath();
}

function contains(transform, pos) {
    var tr = transform.size.scale(0.5);
    var bl = transform.size.scale(-0.5);
    var p  = transform.toLocalSpace(pos);

    // saveCtx();
    // transform.transformCtx(frame.context);
    // rect(0, 0, transform.size.x, transform.size.y, '#ff00ff', '#000');
    // restoreCtx();
    // circle(pos.x, pos.y, 5, '#00ff00', '#000', 1 / camera.zoom);

    return (p.x > bl.x &&
            p.y > bl.y &&
            p.x < tr.x &&
            p.y < tr.y);
}

function circleContains(transform, pos) {
    var v = transform.toLocalSpace(pos);
    return (v.len2() <= transform.size.x*transform.size.x/4);
}

function ioPort(x1, y1, x2, y2, col, bCol, r, s) {
    strokeLine(x1, y1, x2, y2, (bCol === undefined ? '#000' : bCol), (s === undefined ? 2 : s));
    circle(x2, y2, (r === undefined ? 7 : r), (col === undefined ? '#fff' : col), (bCol === undefined ? '#000' : bCol), 1);
}
