class LED extends IOObject {
    constructor(context, x, y, color) {
        super(context, x, y, DEFAULT_SIZE, DEFAULT_SIZE, images["led.svg"], false, 1, 0);
        this.transform.setPos(V(this.transform.pos.x, this.transform.pos.y - 2*this.transform.size.y));
        this.color = (color == undefined) ? ("#ffffff") : (color);
        this.connectorWidth = 5;

        this.setInputAmount(1);
        this.inputs[0].setOrigin(V(0, 0));
        this.inputs[0].setTarget(V(0, 2*this.transform.size.y));
        this.inputs[0].lineColor = '#ffffff';
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
    copy() {
        var copy = super.copy();
        copy.color = this.color;
        copy.connectorWidth = this.connectorWidth;
        return copy;
    }
    writeTo(node) {
        var LEDNode = super.writeTo(node);
        createTextElement(LEDNode, "color", this.color);
        return LEDNode;
    }
    load(node) {
        super.load(node);
        var color = getStringValue(getChildNode(node, "color"));
        this.color = color;
        return this;
    }
}
