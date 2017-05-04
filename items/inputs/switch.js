class Switch extends IOObject {
    constructor(x, y) {
        super(x, y, 60*images["switchUp.svg"].ratio, 60, images["switchUp.svg"], true, 0, 1, 77*images["switchUp.svg"].ratio, 77);
    }
    click() {
        this.activate(!this.outputs[0].isOn);
        this.img = images[this.outputs[0].isOn ? "switchDown.svg" : "switchUp.svg"];
    }
    getInputPortCount() {
        return 0;
    }
    getDisplayName() {
        return "Switch";
    }
}
