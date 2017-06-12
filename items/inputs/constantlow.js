class ConstantLow extends IOObject {
    constructor(context, x, y) {
        super(context, x, y, 50, 50, images["constLow.svg"], false, 0, 1);
        super.activate(false);
    }
    getDisplayName() {
        return "Constant Low";
    }
    writeTo(node, uid) {
        var constantLowNode = createChildNode(node, "constantlow");
        super.writeTo(constantLowNode, uid);
    }
}

function loadConstantLow(node) {
    var uid = getIntValue(getChildNode(node, "uid"));
    var x = getFloatValue(getChildNode(node, "x"));
    var y = getFloatValue(getChildNode(node, "y"));
    var angle = getFloatValue(getChildNode(node, "angle"));

    var o = new ConstantLow(x, y);
    o.setAngle(angle);

    objects[uid] = o;
}
