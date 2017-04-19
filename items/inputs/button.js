// key board input inputs

class Button extends IOObject {
    constructor(x, y) {
        super(x, y, 50, 50, images["buttonUp.svg"], true, 0, 1, 60, 60);
        this.curPressed = false;
    }
    press() {
        super.activate(true);
        this.curPressed = true;
        this.img = images["buttonDown.svg"];
    }
    release() {
        super.activate(false);
        this.curPressed = false;
        this.img = images["buttonUp.svg"];
    }
    contains(pos) {
        return circleContains(this.transform, pos);
    }
    getInputPortCount() {
        return 0;
    }
    getDisplayName() {
        return "Button";
    }
}
