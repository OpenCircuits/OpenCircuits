class Gate extends IOObject {
    constructor(x, y, startInputs, size, img, not) {
        super(x, y, size, false, true, 999, 999);
        this.img = img;
        this.not = not;
        this.setInputAmount(startInputs);
    }
    getPos() {
        return V(this.x, this.y);
    }
    setInputAmount(x) {
        while (this.inputs.length > x)
            this.inputs.splice(this.inputs.length-1, 1);
        while (this.inputs.length < x)
            this.inputs.push(undefined);
    }
    click() {
        console.log("ASD");
    }
    activate(on) {
        super.activate((this.not ? !on : on));
    }
    draw() {
        super.draw();
        var outV = this.getOutputPos();
        ioPort(this.x, this.y, outV.x, outV.y, this.getCol(), this.getBorderColor());
        for (var i = 0; i < this.inputs.length; i++) {
            var inV = this.getInputPos(i);

            var l = -this.size/2*(i - this.inputs.length/2 + 0.5);
            if (i === 0) l -= 1;
            if (i === this.inputs.length-1) l += 1;
            ioPort(l*this.orientation.y+this.x-this.size/2*this.orientation.x, l*this.orientation.x+this.y+this.size/2*this.orientation.y, inV.x, inV.y, this.getCol(), this.getBorderColor());
        }

        var w = this.size*this.img.width/this.img.height;
        var l = (w - this.size)/2;

        drawRotatedImage(this.img, this.x-l*this.orientation.x, this.y+l*this.orientation.y, w, this.size, this.getAngle(), this.getCol());

        if (this.not) {
            var l = this.size/2+5/2;
            circle(this.x+l*this.orientation.x, this.y-l*this.orientation.y, 5, this.getCol(), this.getBorderColor(), 2 / camera.zoom);
        }
    }
    getInputPos(i) {
        var l = this.size * 0.5 * (i - this.inputs.length/2 + 0.5);
        if (i === 0) l += 1;
        if (i === this.inputs.length-1) l -= 1;
        return V(this.x-this.orientation.x*IO_PORT_LENGTH-this.orientation.y*l, this.y+this.orientation.y*IO_PORT_LENGTH-this.orientation.x*l);
    }
    getInputPortCount() {
        return this.inputs.length;
    }
    getDisplayName() {
        return "Gate";
    }
}
