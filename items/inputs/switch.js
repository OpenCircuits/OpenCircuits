class Switch extends IOObject {
    constructor(context, x, y) {
        super(context, x, y, 60*images["switchUp.svg"].ratio, 60, images["switchUp.svg"], true, 0, 1, 77*images["switchUp.svg"].ratio, 77);
    }
    click() {
        this.activate(!this.outputs[0].isOn);
        this.img = images[this.outputs[0].isOn ? "switchDown.svg" : "switchUp.svg"];
    }
    getInputPortCount() {
        return 0;
    }
    getDisplayName() {
        return "Switch";
    }
    writeTo(node, uid) {
        var switchNode = createChildNode(node, "switch");
        super.writeTo(switchNode, uid);
        createTextElement(switchNode, "isOn", this.outputs[0].isOn);
    }
}

function loadSwitch(node) {
    var uid = getIntValue(getChildNode(node, "uid"));
    var x = getFloatValue(getChildNode(node, "x"));
    var y = getFloatValue(getChildNode(node, "y"));
    var angle = getFloatValue(getChildNode(node, "angle"));
    var isOn = getBooleanValue(getChildNode(node, "isOn"));

    var o = new Switch(x, y);
    if (isOn)
        o.click(isOn);
    o.setAngle(angle);

    objects[uid] = o;
}
