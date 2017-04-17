class XORGate extends Gate {
    constructor(not, x, y) {
        super(x, y, 2, 50, images["or.svg"], not);
    }
    activate(x) {
        var on = false;
        for (var i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i] !== undefined && this.inputs[i].isOn) {
                if (on === true) {
                    on = false;
                    break;
                }
                on = true;
            }
        }
        super.activate(on);
    }
    draw() {
        super.draw();
        var h = 3;
        var x = 10;

        var l1 = -(this.size/2+h)*(0.5-this.inputs.length/2);
        var l2 = -(this.size/2+h)*(this.inputs.length/2-0.5);

        var l = this.size * this.img.width / this.img.height;

        var d = l/2 + h + x;

        var p1 = V(this.x - d*this.orientation.x - this.size/2*this.orientation.y, this.y - this.size/2*this.orientation.x + d*this.orientation.y);
        var p2 = V(this.x - d*this.orientation.x + this.size/2*this.orientation.y, this.y + this.size/2*this.orientation.x + d*this.orientation.y);
        var c = V(this.x - (l/4 + h/2 + x/2)*this.orientation.x, this.y + (this.size/4 + h + x/2)*this.orientation.y);

        strokeQuadCurve(p1.x, p1.y, p2.x, p2.y, c.x, c.y, '#000000', 2/camera.zoom);
    }
    getDisplayName() {
        return this.not ? "XNOR Gate" : "XOR Gate";
    }
}
