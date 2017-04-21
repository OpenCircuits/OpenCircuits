class Wire {
    constructor(host, t) {
        var p = host.getPos(t);
        var c = host.getDir(t).scale(50).add(p);
        this.curve = new BezierCurve(p, V(0,0), c, V(0,0));
        this.straight = false;

        wires.push(this);
    }
    activate(on) {
        if (this.isOn === on)
            return;

        this.isOn = on;
        if (this.connection !== undefined)
            propogationQueue.push(new Propogation(this, this.connection, this.isOn));
    }
    press(t) {
        var wire = new Wire(this, t);
        var obj = this.connection;
        this.disconnect(obj);

        wire.connect(obj);
        this.connect(wire);
    }
    draw() {
        if (this.straight) {
            var p1 = camera.getScreenPos(this.curve.p1);
            var p2 = camera.getScreenPos(this.curve.p2);
            strokeLine(p1.x, p1.y, p2.x, p2.y, this.isOn ? '#3cacf2' : '#fff', 7 / camera.zoom);
        } else {
            this.curve.draw(this.isOn ? '#3cacf2' : '#fff', 7 / camera.zoom);
        }

        // this.curve.debugDraw(12);

        if (this.connection instanceof Wire) {
            var v = camera.getScreenPos(this.curve.p2);
            circle(v.x, v.y, 7 / camera.zoom, '#fff', '#000', 1);
        }
    }
    move(x, y) {
        // Snap to end points
        this.straight = false;
        this.connection.straight = false;
        if (Math.abs(x - this.curve.p1.x) <= 10) {
            x = this.curve.p1.x;
            this.straight = true;
        }
        if (Math.abs(y - this.curve.p1.y) <= 10) {
            y = this.curve.p1.y;
            this.straight = true;
        }
        if (Math.abs(x - this.connection.curve.p2.x) <= 10) {
            x = this.connection.curve.p2.x;
            this.connection.straight = true;
        }
        if (Math.abs(y - this.connection.curve.p2.y) <= 10) {
            y = this.connection.curve.p2.y;
            this.connection.straight = true;
        }

        this.curve.c2.x += x - this.curve.p2.x;
        this.curve.c2.y += y - this.curve.p2.y;
        this.curve.p2.x = x;
        this.curve.p2.y = y;
        this.connection.curve.c1.x += x - this.connection.curve.p1.x;
        this.connection.curve.c1.y += y - this.connection.curve.p1.y;
        this.connection.curve.p1.x = x;
        this.connection.curve.p1.y = y;
    }
    contains(pos) {
        return this.curve.getNearestT(pos.x,pos.y) !== -1;
    }
    getPos(t) {
        return this.curve.getPos(t);
    }
    getDir(t) {
        return this.curve.getVel(t).normalize();
    }
    connect(obj) {
        if (obj.input !== undefined)
            return false;

        var p = obj.getPos(0);
        var c = obj.getDir(0).scale(50 * (obj instanceof Wire ? -1 : 1)).add(p);

        this.curve.update(this.curve.p1, p, this.curve.c1, c);

        this.connection = obj;
        obj.input = this;

        return true;
    }
    disconnect(obj) {
        if (this.connection !== obj)
            return false;

        obj.input = undefined;
        this.connection = undefined;
    }
    getDisplayName() {
        return "Wire";
    }
}
