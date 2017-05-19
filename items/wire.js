class Wire {
    constructor(input, t) {
        this.input = input;

        var p, c;
        if (input !== undefined) {
            p = input.getPos(t);
            c = input.getDir(t).scale(50).add(p);
            wires.push(this);
        } else {
            p = V(0, 0);
            c = V(0, 0);
        }
        this.curve = new BezierCurve(p, V(0,0), c, V(0,0));
        this.straight = false;
    }
    activate(on) {
        if (this.isOn === on)
            return;

        this.isOn = on;
        if (this.connection !== undefined) {
            if (this.connection instanceof Wire)
                this.connection.activate(on);
            else
                propogationQueue.push(new Propogation(this, this.connection, this.isOn));
        }
    }
    press(t) {
        var wire = new Wire(this, t);
        var obj = this.connection;
        this.disconnect(obj);

        wire.connect(obj);
        this.connect(wire);
    }
    remove() {
        if (this.input !== undefined) {
            if (this.input instanceof Wire) {
                this.input.connection = undefined;
                this.input.remove();
            } else {
                var i = -1;
                for (i = 0; i < this.input.connections.length && this.input.connections[i] !== this; i++);
                this.input.connections.splice(i, 1);
            }
            this.input = undefined;
        }
        if (this.connection !== undefined) {
            if (this.connection instanceof Wire) {
                this.connection.input = undefined;
                this.connection.remove();
            } else {
                this.connection.input = undefined;
            }
            this.connection = undefined;
        }
        wires.splice(getIndexOfWire(this), 1);
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
    getNearestT(mx, my) {
        return (this.straight) ? (-1) : (this.curve.getNearestT(mx, my));
    }
    connect(obj) {
        if (obj.input !== undefined && obj.input !== this)
            return false;

        var p = obj.getPos(0);
        var c = obj.getDir(0).scale(50 * (obj instanceof Wire ? -1 : 1)).add(p);

        this.curve.update(this.curve.p1, p, this.curve.c1, c);

        this.connection = obj;
        obj.input = this;

        obj.activate(this.isOn);

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
    writeTo(node, uid) {
        var wireNode = createChildNode(node, "wire");

        createTextElement(wireNode, "uid", uid);

        var inputNode = createChildNode(wireNode, "input");
        var inputUID = (this.input instanceof Wire) ? (getIndexOfWire(this.input)+objects.length) : (getIndexOfObject(this.input.parent));
        var inputIndx = (this.input instanceof Wire) ? (0) : (this.input.getIndexOfParent());
        createTextElement(inputNode, "uid", inputUID);
        createTextElement(inputNode, "index", inputIndx);

        var connectionNode = createChildNode(wireNode, "connection");
        var connectionUID = (this.connection instanceof Wire) ? (getIndexOfWire(this.connection)+objects.length) : (getIndexOfObject(this.connection.parent));
        var connectionIndx = (this.connection instanceof Wire) ? (0) : (this.connection.getIndexOfParent());
        createTextElement(connectionNode, "uid", connectionUID);
        createTextElement(connectionNode, "index", connectionIndx);

        var bezierNode = createChildNode(wireNode, "bezier");
        createTextElement(bezierNode, "p1x", this.curve.p1.x);
        createTextElement(bezierNode, "p1y", this.curve.p1.y);
        createTextElement(bezierNode, "p2x", this.curve.p2.x);
        createTextElement(bezierNode, "p2y", this.curve.p2.y);
        createTextElement(bezierNode, "c1x", this.curve.c1.x);
        createTextElement(bezierNode, "c1y", this.curve.c1.y);
        createTextElement(bezierNode, "c2x", this.curve.c2.x);
        createTextElement(bezierNode, "c2y", this.curve.c2.y);

        createTextElement(wireNode, "straight", this.straight);
    }
}

function loadWire(node) {
    var wire = new Wire();

    var uid = getIntValue(getChildNode(node, "uid"));
    wires[uid-objects.length] = wire;

    var bezier = getChildNode(node, "bezier");
    var p1 = V(getFloatValue(getChildNode(bezier, "p1x")), getFloatValue(getChildNode(bezier, "p1y")));
    var p2 = V(getFloatValue(getChildNode(bezier, "p2x")), getFloatValue(getChildNode(bezier, "p2y")));
    var c1 = V(getFloatValue(getChildNode(bezier, "c1x")), getFloatValue(getChildNode(bezier, "c1y")));
    var c2 = V(getFloatValue(getChildNode(bezier, "c2x")), getFloatValue(getChildNode(bezier, "c2y")));

    wire.curve.update(p1, p2, c1, c2);

    var straight = getBooleanValue(getChildNode(node, "straight"));
    wire.straight = straight;
}

function loadWireConnections(wire, node) {
    var inputNode = getChildNode(node, "input");
    var sourceUID = getIntValue(getChildNode(inputNode, "uid"));
    var sourceIndx = getIntValue(getChildNode(inputNode, "index"));
    var source = (sourceUID >= objects.length) ? (wires[sourceUID-objects.length]) : (objects[sourceUID].outputs[sourceIndx]);

    var connectionNode = getChildNode(node, "connection");
    var targetUID = getIntValue(getChildNode(connectionNode, "uid"));
    var targetIndx = getIntValue(getChildNode(connectionNode, "index"));
    var target = (targetUID >= objects.length) ? (wires[targetUID-objects.length]) : (objects[targetUID].inputs[targetIndx]);

    wire.input = source;
    source.connect(wire);
    wire.connect(target);
}
