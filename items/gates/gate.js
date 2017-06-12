class Gate extends IOObject {
    constructor(context, not, x, y, img) {
        super(context, x, y, DEFAULT_SIZE*(img !== undefined ? img.ratio : 1), DEFAULT_SIZE, img, false, 999, 999);
        this.not = not;
        this.name = this.getDisplayName();

        this.setInputAmount(2);
    }
    click() {
        console.log("ASD");
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
            renderer.circle(l, 0, 5, this.getCol(), this.getBorderColor(), 2);
        }
        renderer.restore();
    }
    getDisplayName() {
        return "Gate";
    }
    writeTo(node, uid) {
        super.writeTo(node, uid);
        createTextElement(node, "not", this.not);
        createTextElement(node, "inputcount", this.inputs.length);
    }
}
