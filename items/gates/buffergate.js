class BUFGate extends Gate {
    constructor(not, x, y) {
        super(not, x, y, images["buffer.svg"]);
        this.maxInputs = 1;

        this.setInputAmount(1);
    }
    activate(x) {
        var on = false;
        for (var i = 0; i < this.inputs.length; i++)
            on = this.inputs[i].isOn;
        super.activate(on);
    }
    getDisplayName() {
        return this.not ? "NOT Gate" : "Buffer Gate";
    }
    writeTo(node, uid) {
        var BufferNode = createChildNode(node, "buffergate");
        super.writeTo(BufferNode, uid);
    }
}

function loadBufferGate(node) {
    var uid = getIntValue(getChildNode(node, "uid"));
    var x = getFloatValue(getChildNode(node, "x"));
    var y = getFloatValue(getChildNode(node, "y"));
    var angle = getFloatValue(getChildNode(node, "angle"));
    var not = getBooleanValue(getChildNode(node, "not"));

    var o = new BUFGate(not, x, y);
    o.setAngle(angle);

    objects[uid] = o;
}
