class ANDGate extends Gate {
    constructor(not, x, y) {
        super(not, x, y, images["and.svg"]);
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
        this.localSpace();
        var l1 = -(this.transform.size.y/2)*(0.5-this.inputs.length/2);
        var l2 = -(this.transform.size.y/2)*(this.inputs.length/2-0.5);

        var s = (this.transform.size.x-2)/2;
        var p1 = V(-s, l1);
        var p2 = V(-s, l2);

        strokeLine(p1.x, p1.y, p2.x, p2.y, this.getBorderColor(), 2);
        restoreCtx();

        super.draw();

    }
    getDisplayName() {
        return this.not ? "NAND Gate" : "AND Gate";
    }
}
