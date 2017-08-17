class Switch extends IOObject {
    constructor(context, x, y) {
        super(context, x, y, 60*images["switchUp.svg"].ratio, 60, images["switchUp.svg"], true, 0, 1, 77*images["switchUp.svg"].ratio, 77);
    }
    activate(on) {
        super.activate(on);
        this.img = images[this.isOn ? "switchDown.svg" : "switchUp.svg"];
    }
    click() {
        super.click();
        this.activate(!this.isOn);
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
Switch.getXMLName = function() { return "switch"; }
Importer.types.push(Switch);
