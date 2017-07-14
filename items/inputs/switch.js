class Switch extends IOObject {
    constructor(context, x, y) {
        super(context, x, y, 60*images["switchUp.svg"].ratio, 60, images["switchUp.svg"], true, 0, 1, 77*images["switchUp.svg"].ratio, 77);
    }
    click() {
        super.click();
        this.activate(!this.outputs[0].isOn);
        this.img = images[this.outputs[0].isOn ? "switchDown.svg" : "switchUp.svg"];
    }
    getInputPortCount() {
        return 0;
    }
    getDisplayName() {
        return "Switch";
    }
    writeTo(node) {
        var switchNode = super.writeTo(node);
        createTextElement(switchNode, "isOn", this.outputs[0].isOn);
        return switchNode;
    }
}
