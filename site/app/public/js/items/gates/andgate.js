class ANDGate extends Gate {
    constructor(context, not, x, y) {
        super(context, not, x, y, images["and.svg"]);
    }
    setInputAmount(target) {
        super.setInputAmount(target);

        for (var i = 0; i < this.inputs.length; i++) {
            var input = this.inputs[i];
            input.origin = V(-(this.transform.size.x-2)/2, input.origin.y);
        }
    }
    activate(x) {
        var on = true;
        for (var i = 0; i < this.inputs.length; i++)
            on = (on && this.inputs[i].isOn);
        super.activate(on);
    }
    draw() {
        var renderer = this.context.getRenderer();

        this.localSpace();
        var l1 = -(this.transform.size.y/2)*(0.5-this.inputs.length/2);
        var l2 = -(this.transform.size.y/2)*(this.inputs.length/2-0.5);

        var s = (this.transform.size.x-2)/2;
        var p1 = V(-s, l1);
        var p2 = V(-s, l2);

        renderer.line(p1.x, p1.y, p2.x, p2.y, this.getBorderColor(), 2);
        renderer.restore();

        super.draw();

    }
    getDisplayName() {
        return this.not ? "NAND Gate" : "AND Gate";
    }
}
ANDGate.getXMLName = function() { return "andgate"; }
Importer.types.push(ANDGate);
