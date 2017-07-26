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

        var port = new WirePort(this);
        wire.connect(prevConnection);
        port.connect(wire);
        this.connect(port);

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
        if (this.connection != undefined)
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
        this.connection = undefined;
    }
    draw() {
        var renderer = this.context.getRenderer();
        var camera = this.context.getCamera();

        if (this.straight) {
            var p1 = camera.getScreenPos(this.curve.p1);
            var p2 = camera.getScreenPos(this.curve.p2);
            renderer.line(p1.x, p1.y, p2.x, p2.y, this.isOn ? '#3cacf2' : '#fff', 7 / camera.zoom);
        } else {
            this.curve.draw(this.isOn ? '#3cacf2' : '#fff', 7 / camera.zoom, renderer);
        }
    }
    contains(pos) {
        return this.curve.getNearestT(pos.x, pos.y) !== -1;
    }
    getPos(t) {
        return this.curve.getPos(t);
    }
    // getDir(t) {
    //     return this.curve.getVel(t).normalize();
    // }
    getNearestT(mx, my) {
        return (this.straight) ? (getNearestT(this.curve.p1, this.curve.p2, mx, my)) : (this.curve.getNearestT(mx, my));
    }
}

// class Wire {
//     constructor(context, input, t) {
//         this.uid = UID_COUNTER++;
//         this.context = context;
//         this.input = input;
//
//         var p, c;
//         if (input != undefined) {
//             p = input.getPos(t);
//             c = input.getDir(t).scale(50).add(p);
//         } else {
//             p = V(0, 0);
//             c = V(0, 0);
//         }
//         this.curve = new BezierCurve(p, V(0,0), c, V(0,0));
//         this.straight = false;
//     }
//     activate(on) {
//         if (this.isOn === on)
//             return;
//
//         this.isOn = on;
//         if (this.connection != undefined)
//             this.connection.activate(on);
//     }
//     press(t) {
//         var wire = new Wire(this.context, this, t);
//         context.getWires().push(wire);
//         var obj = this.connection;
//         this.disconnect(obj);
//         var port = new WirePort(this, wire);
//         wire.connect(obj);
//         this.connect(port);
//         port.connect(wire);
//     }
//     remove() {
//         if (this.input != undefined) {
//             if (this.input instanceof Wire) {
//                 this.input.connection = undefined;
//                 this.input.removeFrom(designer);
//             } else {
//                 var i = -1;
//                 for (i = 0; i < this.input.connections.length && this.input.connections[i] !== this; i++);
//                 this.input.connections.splice(i, 1);
//             }
//             this.input = undefined;
//         }
//         if (this.connection != undefined) {
//             if (this.connection instanceof Wire) {
//                 this.connection.input = undefined;
//                 this.connection.remove();
//             } else {
//                 this.connection.activate(false);
//                 this.connection.input = undefined;
//             }
//             this.connection = undefined;
//         }
//         var index = this.context.getIndexOf(this);
//         this.context.getWires().splice(index, 1);
//     }
//     draw() {
//         var renderer = this.context.getRenderer();
//         var camera = this.context.getCamera();
//
//         if (this.straight) {
//             var p1 = camera.getScreenPos(this.curve.p1);
//             var p2 = camera.getScreenPos(this.curve.p2);
//             renderer.line(p1.x, p1.y, p2.x, p2.y, this.isOn ? '#3cacf2' : '#fff', 7 / camera.zoom);
//         } else {
//             this.curve.draw(this.isOn ? '#3cacf2' : '#fff', 7 / camera.zoom, renderer);
//         }
//
//         // this.curve.debugDraw(12);
//
//         if (this.connection instanceof Wire) {
//             var v = camera.getScreenPos(this.curve.p2);
//             renderer.circle(v.x, v.y, 7 / camera.zoom, '#fff', '#000', 1);
//         }
//     }
//     contains(pos) {
//         return this.curve.getNearestT(pos.x,pos.y) !== -1;
//     }
//     getPos(t) {
//         return this.curve.getPos(t);
//     }
//     getDir(t) {
//         return this.curve.getVel(t).normalize();
//     }
//     getNearestT(mx, my) {
//         return (this.straight) ? (getNearestT(this.curve.p1, this.curve.p2, mx, my)) : (this.curve.getNearestT(mx, my));
//     }
//     connect(obj) {
//         if (obj.input != undefined && obj.input !== this)
//             return false;
//
//         var p = obj.getPos(0);
//         var c = obj.getDir(0).scale(50 * (obj instanceof Wire ? -1 : 1)).add(p);
//
//         this.curve.update(this.curve.p1, p, this.curve.c1, c);
//
//         this.connection = obj;
//         obj.input = this;
//
//         obj.activate(this.isOn);
//
//         return true;
//     }
//     disconnect(obj) {
//         if (this.connection !== obj)
//             return false;
//
//         obj.input = undefined;
//         this.connection = undefined;
//     }
//     getDisplayName() {
//         return "Wire";
//     }
//     getIndex() {
//         return 0;
//     }
//     copy() {
//         var copy = new Wire(this.context);
//         copy.curve = this.curve.copy();
//         copy.straight = this.straight;
//         return copy;
//     }
//     writeTo(node, objects, wires) {
//         var wireNode = createChildNode(node, "wire");
//
//         createTextElement(wireNode, "uid", this.uid);
//
//         var inputNode = createChildNode(wireNode, "input");
//         createTextElement(inputNode, "uid", this.input.uid);
//         createTextElement(inputNode, "index", this.input.getIndex());
//
//         var connectionNode = createChildNode(wireNode, "connection");
//         createTextElement(connectionNode, "uid", this.connection.uid);
//         createTextElement(connectionNode, "index", this.connection.getIndex());
//
//         this.curve.writeTo(wireNode);
//
//         createTextElement(wireNode, "straight", this.straight);
//     }
//     load(node) {
//         var objects = this.context.getObjects();
//         var wires = this.context.getWires();
//
//         var uid = getIntValue(getChildNode(node, "uid"));
//         this.uid = uid;
//
//         var bezier = getChildNode(node, "bezier");
//         this.curve.load(bezier);
//
//         var straight = getBooleanValue(getChildNode(node, "straight"));
//         this.straight = straight;
//
//         return this;
//         // this.context.addWire(this);
//     }
//     loadConnections(node, objects, wires) {
//         var inputNode = getChildNode(node, "input");
//         var sourceUID = getIntValue(getChildNode(inputNode, "uid"));
//         var sourceIndx = getIntValue(getChildNode(inputNode, "index"));
//         var source = findByUID(wires, sourceUID);
//         if (source == undefined)
//             source = findByUID(objects, sourceUID).outputs[sourceIndx];
//         // var source = this.context.findWireByUID(sourceUID);
//         // if (source == undefined)
//         //     source = this.context.findObjectByUID(sourceUID).outputs[sourceIndx];
//
//         var connectionNode = getChildNode(node, "connection");
//         var targetUID = getIntValue(getChildNode(connectionNode, "uid"));
//         var targetIndx = getIntValue(getChildNode(connectionNode, "index"));
//         var target = findByUID(wires, targetUID);
//         if (target == undefined)
//             target = findByUID(objects, targetUID).inputs[targetIndx];
//         // var target = this.context.findWireByUID(targetUID);
//         // if (target == undefined)
//         //     target = this.context.findObjectByUID(targetUID).inputs[targetIndx];
//
//         this.input = source;
//         source.connect(this);
//         this.connect(target);
//     }
// }
