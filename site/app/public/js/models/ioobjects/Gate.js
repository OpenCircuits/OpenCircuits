class Gate extends IOObject {
    constructor(context, not, x, y, img) {
        super(context, x, y, DEFAULT_SIZE*(img != undefined ? img.ratio : 1), DEFAULT_SIZE, img, false, 512, 512);
        this._not = (not ? true : false);
        this.name = this.getDisplayName();

        this.setInputAmount(2);
    }
    set not(value) {
        this._not = value;
        if (value)
            this.outputs[0].isOn = !this.isOn;
    }
    get not() {
        return this._not;
    }
    activate(on, i) {
        super.activate((this.not ? !on : on), i);
    }
    draw() {
        super.draw();

        var renderer = this.context.getRenderer();

        this.localSpace();
        if (this.not) {
            var l = this.transform.size.x/2+5;
            renderer.circle(l, 0, 5, (this.getCol() == undefined ? '#fff' : this.getCol()), this.getBorderColor(), 2);
        }
        renderer.restore();
    }
    getDisplayName() {
        return "Gate";
    }
    copy() {
        var copy = super.copy();
        copy.not = this.not;
        return copy;
    }
    writeTo(node) {
        var gateNode = super.writeTo(node);
        createTextElement(gateNode, "not", this.not);
        createTextElement(gateNode, "inputcount", this.getInputAmount());
        return gateNode;
    }
    load(node) {
        super.load(node);
        var not = getBooleanValue(getChildNode(node, "not"));
        var inputCount = getIntValue(getChildNode(node, "inputcount"), 1);
        this.not = not;
        this.setInputAmount(inputCount);
        return this;
    }
}
