class LED extends IOObject {
    constructor(x, y, color) {
        super(x, y, 50, false, false, 1, 0);
        this.color = color;
        this.connectorWidth = 5;
        this.setAngle(-Math.PI/2);
    }
    draw() {
        rect(this.x, this.y-this.size, this.connectorWidth, 2*this.size, this.getCol(), this.getBorderColor(), 0);
        circle(this.x, this.y, 7, this.getCol(), this.getBorderColor(), 1);
        drawImage(images["led.svg"], this.x, this.y-2*this.size, this.size, this.size, this.color);
        if (this.isOn)
            drawImage(images["ledLight.svg"], this.x, this.y-2*this.size, 3*this.size, 3*this.size, this.color);
    }
    contains(pos) {
        return contains(this.x, this.y-this.size*2, this.size/2, this.size, pos);
    }
    setPos(v) {
        super.setPos(V(v.x, v.y+2*this.size));
    }
    getInputPos(i) {
        return V(this.x, this.y);
    }
    getPos() {
        return V(this.x, this.y-2*this.size);
    }
    getOutputPortCount() {
        return 0;
    }
    getDisplayName() {
        return "LED";
    }
}
