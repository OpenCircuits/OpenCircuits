class ConstantHigh extends IOObject {
    constructor(context, x, y) {
        super(context, x, y, 50, 50, images["constHigh.svg"], false, 0, 1);
        super.activate(true);
    }
    getDisplayName() {
        return "Constant High";
    }
    writeTo(node, uid) {
        var constantHighNode = createChildNode(node, "constanthigh");
        super.writeTo(constantHighNode, uid);
    }
}

function loadConstantHigh(node) {
    var uid = getIntValue(getChildNode(node, "uid"));
    var x = getFloatValue(getChildNode(node, "x"));
    var y = getFloatValue(getChildNode(node, "y"));
    var angle = getFloatValue(getChildNode(node, "angle"));

    var o = new ConstantHigh(x, y);
    o.setAngle(angle);

    objects[uid] = o;
}
