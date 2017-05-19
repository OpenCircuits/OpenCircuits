class IOObject {
    constructor(x, y, w, h, img, isPressable, maxInputs, maxOutputs, selectionBoxWidth, selectionBoxHeight) {
        x = (x === undefined ? 0 : x);
        y = (y === undefined ? 0 : y)
        this.transform = new Transform(V(x, y), V(w, h), 0);

        this.name = this.getDisplayName();
        this.img = img;
        this.isOn = false;
        this.isPressable = isPressable;
        this.maxInputs = maxInputs;
        this.maxOutputs = maxOutputs;
        this.selected = false;

        if (this.isPressable)
            this.selectionBoxTransform = new Transform(V(x, y), V(selectionBoxWidth, selectionBoxHeight), 0);

        this.outputs = [];
        this.inputs = [];

        this.setOutputAmount(1);
    }
    setInputAmount(target) {
        target = clamp(target, 0, this.maxInputs);
        while (this.inputs.length > target)
            this.inputs.splice(this.inputs.length-1, 1);
        while (this.inputs.length < target)
            this.inputs.push(new IPort(this));

        for (var i = 0; i < this.inputs.length; i++)
            this.inputs[i].updatePosition();
        this.onTransformChange();
    }
    setOutputAmount(target) {
        target = clamp(target, 0, this.maxOutputs);
        while (this.outputs.length > target)
            this.outputs.splice(this.outputs.length-1, 1);
        while (this.outputs.length < target)
            this.outputs.push(new OPort(this));

        for (var i = 0; i < this.outputs.length; i++)
            this.outputs[i].updatePosition();
    }
    onTransformChange() {
        if (this.isPressable && this.selectionBoxTransform !== undefined) {
            this.selectionBoxTransform.setPos(this.transform.getPos());
            this.selectionBoxTransform.setAngle(this.transform.getAngle());
            this.selectionBoxTransform.setScale(this.transform.getScale());
        }
        for (var i = 0; i < this.inputs.length; i++)
            this.inputs[i].onTransformChange();
        for (var i = 0; i < this.outputs.length; i++)
            this.outputs[i].onTransformChange();
    }
    getInputAmount() {
        return this.inputs.length;
    }
    getImageTint() {
        return this.getCol();
    }
    getCol() {
        return (this.selected ? '#1cff3e' : undefined);
    }
    getBorderColor() {
        return (this.selected ? '#0d7f1f' : undefined);
    }
    setPos(v) {
        this.transform.setPos(v);
        this.onTransformChange();
    }
    getPos() {
        return V(this.transform.pos.x, this.transform.pos.y);
    }
    setAngle(a) {
        this.transform.setAngle(a);
        this.onTransformChange();
    }
    // setRotationAbout(a, c) {
    //     this.transform.rotateAbout(a-this.getAngle(), c);
    //     this.onTransformChange();
    // }
    setRotationAbout(a, c) {
        this.transform.rotateAbout(-this.getAngle(), c);
        this.transform.rotateAbout(a, c);
        this.onTransformChange();
    }
    getAngle() {
        return this.transform.angle;
    }
    click() {
    }
    press() {
    }
    release() {
    }
    activate(on, i) {
        if (i === undefined)
            i = 0;

        this.isOn = on;
        if (this.outputs[i] !== undefined)
            this.outputs[i].activate(on);
    }
    localSpace() {
        saveCtx();
        this.transform.transformCtx(frame.context);
    }
    draw() {
        this.localSpace();
        for (var i = 0; i < this.inputs.length; i++)
            this.inputs[i].draw();
        for (var i = 0; i < this.outputs.length; i++)
            this.outputs[i].draw(i);
        if (this.isPressable && this.selectionBoxTransform !== undefined)
            rect(0, 0, this.selectionBoxTransform.size.x, this.selectionBoxTransform.size.y, this.getCol(), this.getBorderColor());
        drawImage(this.img, 0, 0, this.transform.size.x, this.transform.size.y, this.getImageTint());
        restoreCtx();
    }
    contains(pos) {
        return containsPoint(this.transform, pos);
    }
    sContains(pos) {
        return (!this.isPressable &&  this.contains(pos)) ||
                (this.isPressable && !this.contains(pos) && containsPoint(this.selectionBoxTransform, pos));
    }
    iPortContains(pos) {
        for (var i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i].contains(pos))
                return i;
        }
        return -1;
    }
    oPortContains(pos) {
        for (var i = 0; i < this.outputs.length; i++) {
            if (this.outputs[i].contains(pos))
                return i;
        }
        return -1;
    }
    getDisplayName() {
        return "IOObject";
    }
    getName() {
        return this.name;
    }
    writeTo(node, uid) {
        createTextElement(node, "uid", uid);
        createTextElement(node, "x", this.getPos().x);
        createTextElement(node, "y", this.getPos().y);
        createTextElement(node, "angle", this.getAngle());
    }
}
