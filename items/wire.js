class Wire {
    constructor(context) {
        this.uid = UID_COUNTER++;
        this.context = context;

        this.input = undefined;
        this.connection = undefined;

        this.curve = new BezierCurve(V(0,0),V(0,0),V(0,0),V(0,0));
        this.isOn = false;
        this.set = false; // Manually set bezier control points

        this.straight = false;
    }
    activate(on) {
        if (this.isOn === on)
            return;

        this.isOn = on;
        if (this.connection != undefined)
            this.connection.activate(on);
    }
    split(t) {
        var pos = this.curve.getPos(t);

        var wire = new Wire(this.context);

        var prevConnection = this.connection;
        this.disconnect();

        var port = new WirePort(this.context);
        this.connect(port);
        wire.connect(prevConnection);
        port.connect(wire);

        this.connection.setPos(pos);

        getCurrentContext().addObject(port);
        getCurrentContext().addWire(wire);
    }
    onTransformChange() {
        if (this.input != undefined) {
            var pos = this.input.getPos();
            if (this.set) {
                this.curve.c1.x += pos.x - this.curve.p1.x;
                this.curve.c1.y += pos.y - this.curve.p1.y;
            } else {
                var dir = (this.input instanceof WirePort ? this.input.getODir() : this.input.getDir());
                var c = dir.scale(DEFAULT_SIZE).add(pos);
                this.curve.c1.x = c.x;
                this.curve.c1.y = c.y;
            }
            this.curve.p1.x = pos.x;
            this.curve.p1.y = pos.y;
        }
        if (this.connection != undefined) {
            var pos = this.connection.getPos();
            if (this.set) {
                this.curve.c2.x += pos.x - this.curve.p2.x;
                this.curve.c2.y += pos.y - this.curve.p2.y;
            } else {
                var dir = this.connection.getDir();
                var c = dir.scale(DEFAULT_SIZE).add(pos);
                this.curve.c2.x = c.x;
                this.curve.c2.y = c.y;
            }
            this.curve.p2.x = pos.x;
            this.curve.p2.y = pos.y;
        }
    }
    connect(obj) {
        if (this.connection != undefined || obj.input != undefined)
            return false;

        this.connection = obj;
        obj.input = this;
        this.onTransformChange();
        obj.activate(this.isOn);

        return true;
    }
    disconnect() {
        if (this.connection == undefined)
            return false;

        this.connection.input = undefined;
        this.connection.activate(false);
        this.connection = undefined;
    }
    draw() {
        var renderer = this.context.getRenderer();
        var camera = this.context.getCamera();

        var color = (this.isOn ? '#3cacf2' : (this.selected ? '#1cff3e' : DEFAULT_FILL_COLOR));
        if (this.straight) {
            var p1 = camera.getScreenPos(this.curve.p1);
            var p2 = camera.getScreenPos(this.curve.p2);
            renderer.line(p1.x, p1.y, p2.x, p2.y, color, 7 / camera.zoom);
        } else {
            this.curve.draw(color, 7 / camera.zoom, renderer);
        }
    }
    remove() {
        this.context.remove(this);
        if (this.input != undefined)
            this.input.disconnect(this);
        if (this.connection != undefined)
            this.disconnect(this.connection);
    }
    contains(pos) {
        return this.curve.getNearestT(pos.x, pos.y) !== -1;
    }
    setName(n) {
    }
    setPos() {
    }
    getPos(t) {
        if (t == undefined)
            t = 0.5;
        return this.curve.getPos(t);
    }
    getNearestT(mx, my) {
        return (this.straight) ? (getNearestT(this.curve.p1, this.curve.p2, mx, my)) : (this.curve.getNearestT(mx, my));
    }
    getInputAmount() {
        return 1;
    }
    getMaxInputFieldCount() {
        return 1;
    }
    getMinInputFieldCount() {
        return 1;
    }
    getName() {
        return this.getDisplayName();
    }
    getDisplayName() {
        return "Wire";
    }
    copy() {
        var copy = new Wire(this.context);
        copy.curve = this.curve.copy();
        copy.straight = this.straight;
        return copy;
    }
    writeTo(node, objects, wires) {
        var wireNode = createChildNode(node, "wire");

        createTextElement(wireNode, "uid", this.uid);

        var inputNode = createChildNode(wireNode, "input");
        createTextElement(inputNode, "uid", this.input.uid);
        createTextElement(inputNode, "index", this.input.getIndex());

        var connectionNode = createChildNode(wireNode, "connection");
        createTextElement(connectionNode, "uid", this.connection.uid);
        createTextElement(connectionNode, "index", this.connection.getIndex());

        this.curve.writeTo(wireNode);

        createTextElement(wireNode, "straight", this.straight);
    }
    load(node) {
        var objects = this.context.getObjects();
        var wires = this.context.getWires();

        var uid = getIntValue(getChildNode(node, "uid"));
        this.uid = uid;

        var bezier = getChildNode(node, "bezier");
        this.curve.load(bezier);

        var straight = getBooleanValue(getChildNode(node, "straight"));
        this.straight = straight;

        return this;
    }
    loadConnections(node, objects) {
        var inputNode = getChildNode(node, "input");
        var sourceUID = getIntValue(getChildNode(inputNode, "uid"));
        var sourceIndx = getIntValue(getChildNode(inputNode, "index"));
        var source = findByUID(objects, sourceUID);
        source = (source instanceof WirePort ? source : source.outputs[sourceIndx]);

        var connectionNode = getChildNode(node, "connection");
        var targetUID = getIntValue(getChildNode(connectionNode, "uid"));
        var targetIndx = getIntValue(getChildNode(connectionNode, "index"));
        var target = findByUID(objects, targetUID);
        target = (target instanceof WirePort ? target : target.inputs[targetIndx]);

        source.connect(this);
        this.connect(target);
    }
}
