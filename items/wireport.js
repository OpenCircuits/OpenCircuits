class WirePort {
    constructor(wire1) {
        this.context = wire1.context;
        this.input = wire1;
        this.connection = undefined;
        this.isOn = false;
        this.transform = new Transform(this.input.curve.p2.copy(), V(15,15), 0, this.context.getCamera());
        this.selected = false;
    }
    activate(on) {
        this.connection.activate(on);
    }
    onTransformChange() {
        this.input.onTransformChange();
        this.connection.onTransformChange();
    }
    connect(wire) {
        if (this.connection != undefined)
            return false;

        this.connection = wire;
        wire.input = this;
        wire.onTransformChange();
        wire.activate(this.isOn);

        return true;
    }
    disconnect() {
        if (this.connection == undefined)
            return;

        this.connection.input = undefined;
        this.connection = undefined;
    }
    draw() {
        var renderer = this.context.getRenderer();
        var camera = this.context.getCamera();

        var v = camera.getScreenPos(this.getPos());
        renderer.circle(v.x, v.y, 7 / camera.zoom, (this.selected ? '#1cff3e' : '#ffffff'), (this.selected ? '#0d7f1f' : '#000000'), 1 / camera.zoom);
    }
    contains(pos) {
        return circleContains(this.transform, pos);
    }
    sContains(pos) {
        return this.contains(pos);
    }
    setTransform(t) {
        this.transform = t;
        this.onTransformChange();
    }
    setPos(v) {
        // Snap to end points of wires
        this.input.straight = false;
        this.connection.straight = false;
        v.x = snap(this.input, v.x, this.input.curve.p1.x);
        v.y = snap(this.input, v.y, this.input.curve.p1.y);
        v.x = snap(this.connection, v.x, this.connection.curve.p2.x);
        v.y = snap(this.connection, v.y, this.connection.curve.p2.y);

        this.transform.setPos(v);
        this.onTransformChange();
    }
    setRotationAbout(a, c) {
        this.transform.rotateAbout(-this.getAngle(), c);
        this.transform.rotateAbout(a, c);
        this.onTransformChange();
    }
    oPortContains() {
        return -1;
    }
    iPortContains() {
        return -1;
    }
    getPos() {
        return this.transform.pos.copy();
    }
    getAngle() {
        return this.transform.angle;
    }
    getDir() {
        return this.transform.getMatrix().mul(V(-1, 0)).sub(this.transform.pos).normalize();
    }
    getODir() {
        return this.transform.getMatrix().mul(V(1, 0)).sub(this.transform.pos).normalize();
    }
    getCullBox() {
        return this.transform;
    }
    getDisplayName() {
        return "Port";
    }
    getInputPortCount() {
        return 1;
    }
    getInputAmount() {
        return 1;
    }
    getName() {
        return this.getDisplayName();
    }
}

function snap(wire, x, c) {
    if (Math.abs(x - c) <= WIRE_SNAP_THRESHOLD) {
        wire.straight = true;
        return c;
    }
    return x;
}
