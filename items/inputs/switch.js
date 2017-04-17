class Switch extends IOObject {
    constructor(x, y) {
        super(x, y, 60, false, true, 0, 999);
    }
    click() {
        this.activate(!this.isOn);
    }
    draw() {
        super.draw();
        var outV = this.getOutputPos();
        ioPort(this.x, this.y, outV.x, outV.y, this.getCol(), this.getBorderColor(), 7);
        rect(this.x, this.y, this.size*5/6, this.size, this.getCol(), this.getBorderColor());
        drawImage(images[this.isOn ? "switchDown.svg" : "switchUp.svg"], this.x, this.y, this.size, this.size, this.getCol());
    }
    contains(pos) {
        return contains(this.x, this.y+this.size/14, this.size*3/5, this.size*5/7, pos);
    }
    sContains(pos) {
        return contains(this.x, this.y, this.size*5/6, this.size, pos) && !this.contains(pos);
    }
    getInputPortCount() {
        return 0;
    }
    getDisplayName() {
        return "Switch";
    }
}
