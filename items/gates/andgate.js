class ANDGate extends Gate {
    constructor(not, x, y) {
        super(x, y, 2, 50, images["and.svg"], not);
    }
    activate(x) {
        var on = true;
        var allUndefined = true;
        for (var i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i] !== undefined)
                allUndefined = false;
            if (this.inputs[i] !== undefined && !this.inputs[i].isOn) {
                on = false;
                break;
            }
        }
        super.activate(on && !allUndefined);
    }
    draw() {
        super.draw();
        var h = 3;

        var l1 = -(this.size/2+h)*(0.5-this.inputs.length/2);
        var l2 = -(this.size/2+h)*(this.inputs.length/2-0.5);

        var s = (this.size-h+1)/2;
        var p1 = V(l1*this.orientation.y+this.x-s*this.orientation.x, l1*this.orientation.x+this.y+s*this.orientation.y);
        var p2 = V(l2*this.orientation.y+this.x-s*this.orientation.x, l2*this.orientation.x+this.y+s*this.orientation.y);

        strokeLine(p1.x, p1.y, p2.x, p2.y, this.getBorderColor(), 2/camera.zoom);
    }
    getDisplayName() {
        return this.not ? "NAND Gate" : "AND Gate";
    }
}
