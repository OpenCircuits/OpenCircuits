// key board input inputs

class Button extends IOObject {
    constructor(context, x, y) {
        super(context, x, y, 50, 50, images["buttonUp.svg"], true, 0, 1, 60, 60);
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
    writeTo(node, uid) {
        var buttonNode = createChildNode(node, "button");
        super.writeTo(buttonNode, uid);
    }
}

function loadButton(context, node) {
    var uid = getIntValue(getChildNode(node, "uid"));
    var x = getFloatValue(getChildNode(node, "x"));
    var y = getFloatValue(getChildNode(node, "y"));
    var angle = getFloatValue(getChildNode(node, "angle"));

    var o = new Button(context, x, y);
    o.setAngle(angle);

    objects[uid] = o;
}
