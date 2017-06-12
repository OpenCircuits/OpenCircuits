class LED extends IOObject {
    constructor(context, x, y, color) {
        super(context, x, y, 50, 50, images["led.svg"], false, 1, 0);
        this.transform.setPos(V(this.transform.pos.x, this.transform.pos.y - 2*this.transform.size.y));
        this.color = (color === undefined) ? ("#ffffff") : (color);
        this.connectorWidth = 5;

        this.setInputAmount(1);
        this.inputs[0].setOrigin(V(0, 0));
        this.inputs[0].setTarget(V(0, 2*this.transform.size.y));
        this.inputs[0].lineColor = '#fff';
    }
    getImageTint() {
        return this.color;
    }
    draw() {
        super.draw();

        var renderer = this.context.getRenderer();

        this.localSpace();
        if (this.isOn)
            renderer.image(images["ledLight.svg"], 0, 0, 3*this.transform.size.x, 3*this.transform.size.y, this.color);
        renderer.restore();
    }
    getDisplayName() {
        return "LED";
    }
    writeTo(node, uid) {
        var LEDNode = createChildNode(node, "led");
        super.writeTo(LEDNode, uid);
        console.log(this.color);
        createTextElement(LEDNode, "color", this.color);

        var yNode = getChildNode(LEDNode, "y");
        yNode.removeChild(yNode.childNodes[0]);
        yNode.appendChild(_ROOT.createTextNode(this.getPos().y + 2*this.transform.size.y));
    }
}

function loadLED(node) {
    var uid = getIntValue(getChildNode(node, "uid"));
    var x = getFloatValue(getChildNode(node, "x"));
    var y = getFloatValue(getChildNode(node, "y"));
    var angle = getFloatValue(getChildNode(node, "angle"));
    var color = getStringValue(getChildNode(node, "color"));

    var o = new LED(x, y, color);
    o.setAngle(angle);

    objects[uid] = o;
}
