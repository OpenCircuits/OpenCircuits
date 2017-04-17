
const IO_PORT_LENGTH = 60;


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

function rect(x, y, w, h, tint, bTint, bSize) {
    frame.context.fillStyle = (tint === undefined ? '#fff' : tint);
    frame.context.strokeStyle = (bTint === undefined ? '#000' : bTint);
    frame.context.lineWidth = (bSize === undefined ? 2 : bSize) / camera.zoom;
    var pos = camera.getScreenPos(V(x, y));
    var size = V(w / camera.zoom, h / camera.zoom);
    frame.context.fillRect(pos.x-size.x/2, pos.y-size.y/2, size.x, size.y);
    if (bSize > 0 || bSize === undefined)
        frame.context.strokeRect(pos.x-size.x/2, pos.y-size.y/2, size.x, size.y);
}

function drawImage(img, x, y, w, h, tint) {
    var pos = camera.getScreenPos(V(x, y));
    var size = V(w / camera.zoom, h / camera.zoom);
    if (tint === undefined)
        frame.context.drawImage(img, pos.x-size.x/2, pos.y-size.y/2, size.x, size.y);
    else
        tintDraw(img, pos.x-size.x/2, pos.y-size.y/2, size.x, size.y, tint);
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

    frame.context.drawImage(img, x, y, w, h);
    frame.context.globalAlpha = 0.5;
    frame.context.drawImage(frame.tintCanvas, x, y, w, h);
    frame.context.globalAlpha = 1.0;
}

function strokeCurve(x1, y1, x2, y2, cx1, cy1, cx2, cy2, style, size) {
    frame.context.strokeStyle = (style === undefined ? frame.context.strokeStyle : style);
    frame.context.lineWidth = (size === undefined ? frame.context.lineWidth : size);
    var pos1 = camera.getScreenPos(V(x1, y1));
    var pos2 = camera.getScreenPos(V(x2, y2));
    var cPos1 = camera.getScreenPos(V(cx1, cy1));
    var cPos2 = camera.getScreenPos(V(cx2, cy2));
    frame.context.beginPath();
    frame.context.moveTo(pos1.x, pos1.y);
    frame.context.bezierCurveTo(cPos1.x, cPos1.y, cPos2.x, cPos2.y, pos2.x, pos2.y);
    frame.context.stroke();
}

function strokeQuadCurve(x1, y1, x2, y2, cx, cy, style, size) {
    frame.context.strokeStyle = (style === undefined ? frame.context.strokeStyle : style);
    frame.context.lineWidth = (size === undefined ? frame.context.lineWidth : size);
    var pos1 = camera.getScreenPos(V(x1, y1));
    var pos2 = camera.getScreenPos(V(x2, y2));
    var cPos = camera.getScreenPos(V(cx, cy));
    frame.context.beginPath();
    frame.context.moveTo(pos1.x, pos1.y);
    frame.context.quadraticCurveTo(cPos.x, cPos.y, pos2.x, pos2.y);
    frame.context.stroke();
}

function strokeLine(x1, y1, x2, y2, style, size) {
    frame.context.strokeStyle = (style === undefined ? frame.context.strokeStyle : style);
    frame.context.lineWidth = (size === undefined ? frame.context.lineWidth : size);
    var pos1 = camera.getScreenPos(V(x1, y1));
    var pos2 = camera.getScreenPos(V(x2, y2));
    frame.context.beginPath();
    frame.context.moveTo(pos1.x, pos1.y);
    frame.context.lineTo(pos2.x, pos2.y);
    frame.context.stroke();
}

function circle(x, y, r, style, borderStyle, borderSize) {
    frame.context.fillStyle = (style === undefined ? frame.context.fillStyle : style);
    frame.context.strokeStyle = (borderStyle === undefined ? frame.context.strokeStyle : borderStyle);
    frame.context.lineWidth = (borderSize === undefined ? frame.context.lineWidth : borderSize);
    var pos = camera.getScreenPos(V(x, y));
    frame.context.beginPath();
    frame.context.arc(pos.x, pos.y, r/camera.zoom, 0, 2*Math.PI);
    frame.context.fill();
    frame.context.stroke();
}

function contains(x, y, w, h, pos) {
    return (pos.x > x - w/2 &&
            pos.y > y - h/2 &&
            pos.x < x + w/2 &&
            pos.y < y + h/2);
}

function circleContains(pos1, r, pos2) {
    return pos2.sub(pos1).len2() <= r*r;
}

function ioPort(x1, y1, x2, y2, col, bCol, r, s) {
    strokeLine(x1, y1, x2, y2, (bCol === undefined ? '#000' : bCol), (s === undefined ? 2 : s) / camera.zoom);
    circle(x2, y2, (r === undefined ? 7 : r), (col === undefined ? '#fff' : col), (bCol === undefined ? '#000' : bCol), 1 / camera.zoom);
}
