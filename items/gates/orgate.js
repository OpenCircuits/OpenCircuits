class ORGate extends Gate {
    constructor(not, x, y) {
        super(not, x, y, images["or.svg"]);
    }
    quadCurveXAt(t) {
        var s = this.transform.size.x/2 - 2;
        var l = this.transform.size.x/5 - 2;
        var dt = 1 - t;
        return (dt*dt)*(-s) + 2*t*(dt)*(-l) + (t*t)*(-s);
    }
    setInputAmount(target) {
        super.setInputAmount(target);

        for (var i = 0; i < this.inputs.length; i++) {
            var input = this.inputs[i];
            var t = ((input.origin.y) / this.transform.size.y + 0.5) % 1.0;
            if (t < 0)
                t += 1.0;
            var x = this.quadCurveXAt(t);
            input.origin = V(x, input.origin.y);
        }
    }
    activate(x) {
        var on = false;
        for (var i = 0; i < this.inputs.length; i++)
            on = (on || this.inputs[i].isOn);
        super.activate(on);
    }
    draw() {
        this.localSpace();
        var amt = 2 * Math.floor(this.inputs.length / 4) + 1;
        for (var i = 0; i < amt; i++) {
            var d = (i - Math.floor(amt/2)) * this.transform.size.y;
            var h = 2;
            var l1 = -this.transform.size.y/2;
            var l2 = +this.transform.size.y/2;

            var s = this.transform.size.x/2 - h;
            var l = this.transform.size.x/5 - h;

            var p1 = V(-s, l1 + d);
            var p2 = V(-s, l2 + d);
            var c  = V(-l, d);

            strokeQuadCurve(p1.x, p1.y, p2.x, p2.y, c.x, c.y, this.getBorderColor(), 2);
        }
        restoreCtx();

        super.draw();
    }
    getDisplayName() {
        return this.not ? "NOR Gate" : "OR Gate";
    }
    writeTo(node, uid) {
        var ORNode = createChildNode(node, "orgate");
        super.writeTo(ORNode, uid);
    }
}

function loadORGate(node) {
    var uid = getIntValue(getChildNode(node, "uid"));
    var x = getFloatValue(getChildNode(node, "x"));
    var y = getFloatValue(getChildNode(node, "y"));
    var angle = getFloatValue(getChildNode(node, "angle"));
    var not = getBooleanValue(getChildNode(node, "not"));
    var inputCount = getIntValue(getChildNode(node, "inputcount"));

    var o = new ORGate(not, x, y);
    o.setAngle(angle);
    o.setInputAmount(inputCount);

    objects[uid] = o;
}
