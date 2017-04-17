// key board input inputs

class Button extends IOObject {
    constructor(x, y) {
        super(x, y, 50, false, true, 0, 999);
        this.curPressed = false;
    }
    getPos() {
        return V(this.x, this.y);
    }
    press() {
        super.activate(true);
        this.curPressed = true;
    }
    release() {
        super.activate(false);
        this.curPressed = false;
    }
    draw() {
        super.draw();
        var outV = this.getOutputPos();
        ioPort(this.x, this.y, outV.x, outV.y, this.getCol(), this.getBorderColor(), 7);
        rect(this.x, this.y, this.size, this.size, this.getCol(), this.getBorderColor());
        drawImage(images[this.isOn ? "buttonDown.svg" : "buttonUp.svg"], this.x, this.y, this.size, this.size, this.getCol());
    }
    contains(pos) {
        return circleContains(this.getPos(), this.size/2, pos);
    }
    sContains(pos) {
        return contains(this.x, this.y, this.size, this.size, pos) && !this.contains(pos);
    }
    getInputPortCount() {
        return 0;
    }
    getDisplayName() {
        return "Button";
    }
}
