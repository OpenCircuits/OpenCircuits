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
    draw(style, size, renderer) {
        var camera = renderer.parent.camera;

        var p1 = camera.getScreenPos(this.p1);
        var p2 = camera.getScreenPos(this.p2);
        var c1 = camera.getScreenPos(this.c1);
        var c2 = camera.getScreenPos(this.c2);

        renderer.curve(p1.x, p1.y, p2.x, p2.y, c1.x, c1.y, c2.x, c2.y, style, size);
    }
    debugDraw(r, renderer) {
        var camera = renderer.parent.camera;

        r = (r == undefined ? 3 : r);
        var p1 = camera.getScreenPos(this.p1);
        var p2 = camera.getScreenPos(this.p2);
        var c1 = camera.getScreenPos(this.c1);
        var c2 = camera.getScreenPos(this.c2);
        renderer.circle(p1.x, p1.y, r/camera.zoom, '#ff0000', '#000', 1/camera.zoom);
        renderer.circle(p2.x, p2.y, r/camera.zoom, '#00ff00', '#000', 1/camera.zoom);
        renderer.circle(c1.x, c1.y, r/camera.zoom, '#0000ff', '#000', 1/camera.zoom);
        renderer.circle(c2.x, c2.y, r/camera.zoom, '#ffff00', '#000', 1/camera.zoom);
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
    getDist(t, mx, my) {
        var dx = this.getX(t) - mx;
        var dy = this.getY(t) - my;
        return Math.sqrt(dx*dx + dy*dy);
    }
    getDist2(t, mx, my) {
        var dx = this.getX(t) - mx;
        var dy = this.getY(t) - my;
        return dx*dx + dy*dy;
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
        for (var tt = 0; tt <= 1.0; tt += 1.0 / WIRE_DIST_ITERATIONS) {
            var dist = this.getDist(tt, mx, my);
            if (dist < minDist) {
                t0 = tt;
                minDist = dist;
            }
        }

        // Newton's method to find parameter for when slope is undefined AKA denominator function = 0
        var t1 = findRoots(WIRE_NEWTON_ITERATIONS, t0, mx, my, (t,x,y)=>this.getDistDenominator(t,x,y), (t,x,y)=>this.getDistDenominatorDerivative(t,x,y));
        if (this.getDist2(t1, mx, my) < WIRE_DIST_THRESHOLD2)
            return t1;

        // Newton's method to find parameter for when slope is 0 AKA numerator function = 0
        var t2 = findRoots(WIRE_NEWTON_ITERATIONS, t0, mx, my, (t,x,y)=>this.getDistNumerator(t,x,y), (t,x,y)=>this.getDistNumeratorDerivative(t,x,y));
        if (this.getDist2(t2, mx, my) < WIRE_DIST_THRESHOLD2)
            return t2;

        return -1;
    }
    copy() {
        return new BezierCurve(this.p1.copy(), this.p2.copy(), this.c1.copy(), this.c2.copy());
    }
    writeTo(node) {
        var bezierNode = createChildNode(node, "bezier");
        createTextElement(bezierNode, "p1x", this.p1.x);
        createTextElement(bezierNode, "p1y", this.p1.y);
        createTextElement(bezierNode, "p2x", this.p2.x);
        createTextElement(bezierNode, "p2y", this.p2.y);
        createTextElement(bezierNode, "c1x", this.c1.x);
        createTextElement(bezierNode, "c1y", this.c1.y);
        createTextElement(bezierNode, "c2x", this.c2.x);
        createTextElement(bezierNode, "c2y", this.c2.y);
    }
    load(node) {
        var p1 = V(getFloatValue(getChildNode(node, "p1x")), getFloatValue(getChildNode(node, "p1y")));
        var p2 = V(getFloatValue(getChildNode(node, "p2x")), getFloatValue(getChildNode(node, "p2y")));
        var c1 = V(getFloatValue(getChildNode(node, "c1x")), getFloatValue(getChildNode(node, "c1y")));
        var c2 = V(getFloatValue(getChildNode(node, "c2x")), getFloatValue(getChildNode(node, "c2y")));
        this.update(p1, p2, c1, c2);
    }
}
