class LED extends IOObject {
    constructor(x, y, color) {
        super(x, y, 50, 50, images["led.svg"], false, 1, 0);
        this.transform.pos.y -= 2 * this.transform.size.y;
        this.color = color;
        this.connectorWidth = 5;

        this.setInputAmount(1);
        this.inputs[0].origin = V(0, 0);
        this.inputs[0].target = V(0, 2*this.transform.size.y);
        this.inputs[0].lineColor = '#fff';
    }
    getImageTint() {
        return this.color;
    }
    draw() {
        super.draw();

        this.localSpace();
        if (this.isOn)
            drawImage(images["ledLight.svg"], 0, -2*this.transform.size.y, 3*this.transform.size.x, 3*this.transform.size.y, this.color);
        restoreCtx();
    }
    getDisplayName() {
        return "LED";
    }
}
