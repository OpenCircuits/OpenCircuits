class Wire extends IOObject {
    constructor(host, hostIndex) {
        super(0, 0, 7, false, true, 1, 1);
        this.hostIndex = hostIndex;
        // this.inputs[0] = host;

        var p = host.getOutputPos(hostIndex);
        var c = host.getOutputDir(hostIndex).scale(50).add(p);
        this.curve = new BezierCurve(p, V(0,0), c, V(0,0));

        wires.push(this);
    }
    setAngle(theta) {
    }
    click() {

    }
    press(t) {
        var wire = new Wire(this, 0);
        var obj = this.connections[0];
        this.disconnect(obj);

        wire.connect(obj);
        this.connect(wire);

        // var p = wire.getInputPos(0);
        // var c = wire.getInputDir(0).scale(50).add(p);
        // this.curve.update(this.curve.p1, p, this.curve.c1, c);
    }
    draw() {
        this.curve.draw(this.isOn ? '#3cacf2' : '#fff', 7 / camera.zoom);
        // this.curve.debugDraw();
        if (this.inputs[0] instanceof Wire) {
            circle(this.curve.p1.x, this.curve.p1.y, 7, '#fff', '#000', 1);
        }
    }
    move(x, y) {
        console.log(this.curve);
        console.log(this.connections[0].curve);
        this.curve.c2.x += x - this.curve.p2.x;
        this.curve.c2.y += y - this.curve.p2.y;
        this.curve.p2.x = x;
        this.curve.p2.y = y;
        this.connections[0].curve.c2.x += x - this.connections[0].curve.p1.x;
        this.connections[0].curve.c2.y += y - this.connections[0].curve.p1.y;
        this.connections[0].curve.p1.x = this.curve.p2.x;
        this.connections[0].curve.p1.y = this.curve.p2.y;
    }
    contains(pos) {
        return this.curve.getNearestT(pos.x,pos.y) !== -1;
    }
    getInputPos(i) {
        return this.curve.getPos(0);
    }
    getInputDir(i) {
        return V(0,0);//this.curve.getVel(0).normalize().scale(-1);
    }
    getOutputPos(t) {
        return this.curve.getPos(t);
    }
    getOutputDir(t) {
        return V(0,0);//this.curve.getVel(1).normalize();
    }
    connect(obj, index) {
        if (super.connect(obj, index)) {

            // var indx;
            // for (indx = 0; indx < this.connections.length && this.connections[i] !== this; indx++);

            var p = obj.getInputPos(index);
            var c = obj.getInputDir(index).scale(50).add(p);

            this.curve.update(this.curve.p1, p, this.curve.c1, c);
            return true;
        }
        return false;
    }
    getDisplayName() {
        return "Wire";
    }
}
