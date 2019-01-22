class WirePort extends IOObject {
    constructor(context) {
        super(context, 0, 0, 2*IO_PORT_RADIUS, 2*IO_PORT_RADIUS);
        this._input = undefined;
        this.connection = undefined;
        this.isOn = false;
        this.selected = false;
        this.hasSetTransform = false;
    }
    set input(input) {
        this._input = input;
        if (!this.hasSetTransform) {
            this.hasSetTransform = true;
            this.transform = new Transform(input.curve.p2.copy(), V(15,15), 0, this.context.getCamera());
        }
    }
    get input() {
        return this._input;
    }
    activate(on) {
        if (this.isOn === on)
            return;

        this.isOn = on;
        if (this.connection != undefined)
            this.connection.activate(on);
    }
    remove() {
        this.context.remove(this);
        if (this.input != undefined)
            this.input.disconnect(this);
        if (this.connection != undefined)
            this.disconnect(this.connection);
    }
    setTransform(t) {
        this.transform = t;
        this.setPos(t.pos);
    }
    onTransformChange() {
        if (this.input != undefined)
            this.input.onTransformChange();
        if (this.connection != undefined)
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
    setPos(v) {
        if (this.input != undefined && this.connection != undefined) {
            // Snap to end points of wires
            this.input.straight = false;
            this.connection.straight = false;
            v.x = snap(this.input, v.x, this.input.curve.p1.x);
            v.y = snap(this.input, v.y, this.input.curve.p1.y);
            v.x = snap(this.connection, v.x, this.connection.curve.p2.x);
            v.y = snap(this.connection, v.y, this.connection.curve.p2.y);
        }

        super.setPos(v);
    }
    getIndex() {
        return 0;
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
    getInputAmount() {
        return 1;
    }
    getName() {
        return this.getDisplayName();
    }
    getDisplayName() {
        return "Port";
    }
}
WirePort.getXMLName = function() { return "port"; }
Importer.types.push(WirePort);

function snap(wire, x, c) {
    if (Math.abs(x - c) <= WIRE_SNAP_THRESHOLD) {
        wire.straight = true;
        return c;
    }
    return x;
}
