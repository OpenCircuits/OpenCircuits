class ORGate extends Gate {
    constructor(not, x, y) {
        super(x, y, 2, 50, images["or.svg"], not);//(not ? images["img-nor.svg"] : images["img-or.svg"]), not);
    }
    activate(x) {
        var on = false;
        for (var i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i] !== undefined && this.inputs[i].isOn) {
                on = true;
                break;
            }
        }
        super.activate(on);
    }
    getDisplayName() {
        return this.not ? "NOR Gate" : "OR Gate";
    }
    // draw() {
    //     var outV = this.getOutputPos();
    //     ioPort(this.x, this.y, outV.x, outV.y, 7);
    //     for (var i = 0; i < this.inputs.length; i++) {
    //         var inV = this.getInputPos(i);
    //
    //         var l = -this.size/2*(i - this.inputs.length/2 + 0.5);
    //         ioPort(l*this.orientation.y+this.x, l*this.orientation.x+this.y, inV.x, inV.y, 7);
    //     }
    //     var w = this.size*this.img.width/this.img.height;
    //     drawRotatedImage(this.img, this.x-(w-this.size)/2, this.y, w, this.size, this.getAngle());
    // }
}
