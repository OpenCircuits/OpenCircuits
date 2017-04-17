class ConstantLow extends IOObject {
    constructor(x, y) {
        super(x, y, 50, false, true, 0, 999);
        super.activate(false);
    }
    draw() {
        super.draw();
        var outV = this.getOutputPos();
        ioPort(this.x, this.y, outV.x, outV.y, this.getCol(), this.getBorderColor(), 7);
        drawImage(images["constLow.svg"], this.x, this.y, this.size, this.size, this.getCol());
    }
    getInputPortCount() {
        return 0;
    }
    getDisplayName() {
        return "Constant Low";
    }
}
