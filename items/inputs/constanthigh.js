class ConstantHigh extends IOObject {
    constructor(x, y) {
        super(x, y, 50, false, true, 0, 999);
        super.activate(true);
    }
    draw() {
        super.draw();
        var outV = this.getOutputPos();
        ioPort(this.x, this.y, outV.x, outV.y, this.getCol(), this.getBorderColor(), 7);
        drawImage(images["constHigh.svg"], this.x, this.y, this.size, this.size, this.getCol());
    }
    getInputPortCount() {
        return 0;
    }
    getDisplayName() {
        return "Constant High";
    }
}
