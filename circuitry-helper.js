
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

class BezierCurve {
    constructor(p1, p2, c1, c2) {
        this.p1 = V(p1.x,p1.y);
        this.p2 = V(p2.x,p2.y);
        this.c1 = V(c1.x,c1.y);
        this.c2 = V(c2.x,c2.y);
    }
    update(p1, p2, c1, c2) {
        this.p1.x = p1.x;
        this.p1.y = p1.y;
        this.p2.x = p2.x;
        this.p2.y = p2.y;
        this.c1.x = c1.x;
        this.c1.y = c1.y;
        this.c2.x = c2.x;
        this.c2.y = c2.y;
    }
    draw(style, size) {
        strokeCurve(this.p1.x, this.p1.y, this.p2.x, this.p2.y, this.c1.x, this.c1.y, this.c2.x, this.c2.y, style, size);
    }
    debugDraw() {
        // strokeLine(this.p1.x, this.p1.y, this.c1.x, this.c2.y, )
        circle(this.p1.x, this.p1.y, 3/camera.zoom, '#00ff00', '#000', 1/camera.zoom);
        circle(this.p2.x, this.p2.y, 3/camera.zoom, '#00ff00', '#000', 1/camera.zoom);
        circle(this.c1.x, this.c1.y, 3/camera.zoom, '#00ff00', '#000', 1/camera.zoom);
        circle(this.c2.x, this.c2.y, 3/camera.zoom, '#00ff00', '#000', 1/camera.zoom);
    }
    getX(t) {
        var it = 1 - t;
        return this.p1.x*it*it*it + 3*this.c1.x*t*it*it + 3*this.c2.x*t*t*it + this.p2.x*t*t*t;
    }
    getY(t) {
        var it = 1 - t;
        return this.p1.y*it*it*it + 3*this.c1.y*t*it*it + 3*this.c2.y*t*t*it + this.p2.y*t*t*t;
    }
    getPos(t) {
        return V(this.getX(t), this.getY(t));
    }
    getDX(t) {
        var it = 1 - t;
        return -3*this.p1.x*it*it + 3*this.c1.x*it*(1-3*t) + 3*this.c2.x*t*(2-3*t) + 3*this.p2.x*t*t;
    }
    getDY(t) {
        var it = 1 - t;
        return -3*this.p1.y*it*it + 3*this.c1.y*it*(1-3*t) + 3*this.c2.y*t*(2-3*t) + 3*this.p2.y*t*t;
    }
    getVel(t) {
        return V(this.getDX(t), this.getDY(t));
    }
    getDDX(t) {
        var m = -this.p1.x + 3*this.c1.x - 3*this.c2.x + this.p2.x;
        var b = this.p1.x - 2*this.c1.x + this.c2.x;
        return 6*(m * t + b);
    }
    getDDY(t) {
        var m = -this.p1.y + 3*this.c1.y - 3*this.c2.y + this.p2.y;
        var b = this.p1.y - 2*this.c1.y + this.c2.y;
        return 6*(m * t + b);
    }
    getAcc(t) {
        return V(this.getDDX(t), this.getDDY(t));
    }
    getDist(t, mx, my) {
        var dx = this.getX(t) - mx;
        var dy = this.getY(t) - my;
        return Math.sqrt(dx*dx + dy*dy);
    }
    getDistDenominator(t, mx, my) {
        var dx = this.getX(t) - mx;
        var dy = this.getY(t) - my;
        return dx*dx + dy*dy;
    }
    getDistDenominatorDerivative(t, mx, my) {
        return  2*(this.getX(t) - mx) * this.getDX(t) +
                2*(this.getY(t) - my) * this.getDY(t);
    }
    getDistNumerator(t, mx, my) {
        var dx = this.getX(t) - mx;
        var dy = this.getY(t) - my;
        return  this.getDX(t)*dx +
                this.getDY(t)*dy;
    }
    getDistNumeratorDerivative(t, mx, my) {
        var dx = this.getX(t) - mx;
        var dy = this.getY(t) - my;
        var dbx = this.getDX(t);
        var dby = this.getDY(t);
        return  dbx*dbx + dx*this.getDDX(t) +
                dby*dby + dy*this.getDDY(t);
    }
    getNearestT(mx, my) {
        var minDist = 1e20;
        var t0 = -1;
        for (var tt = 0; tt <= 1.0; tt += 0.1) {
            var dist = this.getDist(tt, mx, my);
            if (dist < minDist) {
                t0 = tt;
                minDist = dist;
            }
        }

        // Newton's method to find root for when slope is undefined
        {
            var amt = 5;
            var t = t0;
            do {
                var f = this.getDistDenominator(t, mx, my);
                var df = this.getDistDenominatorDerivative(t, mx, my);
                if (df === 0)
                    break;
                t = t - f / df;
                if (t > 1.0) t = 0.9;
                if (t < 0.0) t = 0.1;
            } while((amt--) > 0);

            if (this.getDist(t, mx, my) < 15)
                return t;
        }

        // Newton's method to find root for when slope is 0
        {
            var amt = 5;
            var t = t0;
            do {
                var f = this.getDistNumerator(t, mx, my);
                var df = this.getDistNumeratorDerivative(t, mx, my);
                if (df === 0)
                    break;
                t = t - f / df;
                if (t > 1.0) t = 0.9;
                if (t < 0.0) t = 0.1;
            } while((amt--) > 0);

            if (this.getDist(t, mx, my) < 15)
                return t;
        }

        return -1;
    }
}

function ioPort(x1, y1, x2, y2, col, bCol, r, s) {
    strokeLine(x1, y1, x2, y2, (bCol === undefined ? '#000' : bCol), (s === undefined ? 2 : s) / camera.zoom);
    circle(x2, y2, (r === undefined ? 7 : r), (col === undefined ? '#fff' : col), (bCol === undefined ? '#000' : bCol), 1 / camera.zoom);
}

function resize(e) {
    frame.canvas.width = window.innerWidth;
    frame.canvas.height = window.innerHeight;

    render();
}
