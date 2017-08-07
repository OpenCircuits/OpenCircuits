class BezierCurve {
    constructor(p1, p2, c1, c2) {
        this.p1 = V(p1.x,p1.y);
        this.p2 = V(p2.x,p2.y);
        this.c1 = V(c1.x,c1.y);
        this.c2 = V(c2.x,c2.y);
        this.dirty = true;
        this.boundingBox = new Transform(0,0,0,getCurrentContext().getCamera());
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
    updateBoundingBox() {
        if (!this.dirty)
            return;
        this.dirty = false;

        var min = V(0, 0);
        var max = V(0, 0);
        var end1 = this.getPos(0);
        var end2 = this.getPos(1);
        var a = this.c1.sub(this.c2).scale(3).add(this.p2.sub(this.p1));
        var b = this.p1.sub(this.c1.scale(2).add(this.c2)).scale(2);
        var c = this.c1.sub(this.p1);

        var discriminant1 = b.y*b.y - 4*a.y*c.y;
        discriminant1 = (discriminant1 >= 0 ? Math.sqrt(discriminant1) : -1);
        var t1 = (discriminant1 !== -1 ? clamp((-b.y + discriminant1)/(2*a.y),0,1) : 0);
        var t2 = (discriminant1 !== -1 ? clamp((-b.y - discriminant1)/(2*a.y),0,1) : 0);
        max.y = Math.max(this.getY(t1), this.getY(t2), end1.y, end2.y);
        min.y = Math.min(this.getY(t1), this.getY(t2), end1.y, end2.y);

        var discriminant2 = b.x*b.x - 4*a.x*c.x;
        discriminant2 = (discriminant2 >= 0 ? Math.sqrt(discriminant2) : -1);
        var t3 = (discriminant2 !== -1 ? clamp((-b.x + discriminant2)/(2*a.x),0,1) : 0);
        var t4 = (discriminant2 !== -1 ? clamp((-b.x - discriminant2)/(2*a.x),0,1) : 0);
        max.x = Math.max(this.getX(t1), this.getX(t2), end1.x, end2.x);
        min.x = Math.min(this.getX(t1), this.getX(t2), end1.x, end2.x);

        this.boundingBox.setSize(V(max.x - min.x, max.y - min.y));
        this.boundingBox.setPos(V((max.x - min.x)/2 + min.x, (max.y - min.y)/2 + min.y));
    }
    draw(style, size, renderer) {
        var camera = renderer.parent.camera;

        var p1 = camera.getScreenPos(this.p1);
        var p2 = camera.getScreenPos(this.p2);
        var c1 = camera.getScreenPos(this.c1);
        var c2 = camera.getScreenPos(this.c2);

        renderer.curve(p1.x, p1.y, p2.x, p2.y, c1.x, c1.y, c2.x, c2.y, style, size);
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
    getBoundingBox() {
        this.updateBoundingBox();
        return this.boundingBox;
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
