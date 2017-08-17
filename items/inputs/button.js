// key board input inputs

class Button extends IOObject {
    constructor(context, x, y) {
        super(context, x, y, DEFAULT_SIZE, DEFAULT_SIZE, images["buttonUp.svg"], true, 0, 1, 60, 60);
    }
    press() {
        super.activate(true);
        this.img = images["buttonDown.svg"];
    }
    release() {
        super.activate(false);
        this.img = images["buttonUp.svg"];
    }
    contains(pos) {
        return circleContains(this.transform, pos);
    }
    getDisplayName() {
        return "Button";
    }
}
Button.getXMLName = function() { return "button"; }
Importer.types.push(Button);
