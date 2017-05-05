class IOObject {
    constructor(x, y, w, h, img, isPressable, maxInputs, maxOutputs, selectionBoxWidth, selectionBoxHeight) {
        x = (x === undefined ? 0 : x);
        y = (y === undefined ? 0 : y)
        this.transform = new Transform(V(x, y), V(w, h), 0*Math.PI/4);

        this.img = img;
        this.isOn = false;
        this.isPressable = isPressable;
        this.maxInputs = maxInputs;
        this.maxOutputs = maxOutputs;

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
        return (selectionTool.selection === this ? '#1cff3e' : undefined);
    }
    getBorderColor() {
        return (selectionTool.selection === this ? '#0d7f1f' : undefined);
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
        return contains(this.transform, pos);
    }
    sContains(pos) {
        return (!this.isPressable &&  this.contains(pos)) ||
                (this.isPressable && !this.contains(pos) && contains(this.selectionBoxTransform, pos));
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
    connect(obj) {
        var i;
        for (i = 0; i < this.connections.length && this.connections[i] !== undefined; i++);
        if (i >= this.maxOutputs)
            return false;

        var j;
        for (j = 0; j < obj.inputs.length && obj.inputs[j] !== undefined; j++);
        if (j >= obj.maxInputs)
            return false;


        console.log(this instanceof Wire);
        console.log(i + ", " + j);

        this.connections[i] = obj;
        obj.inputs[j] = this;

        obj.activate(this.isOn);
        return true;
    }
    disconnect(obj) {
        var i;
        for (i = 0; i < this.connections.length && this.connections[i] !== obj; i++);
        if (i === this.connections.length)
            return false;

        var j;
        for (j = 0; j < obj.inputs.length && obj.inputs[j] !== this; j++);
        if (j === obj.inputs.length)
            return false;

        this.connections[i] = undefined;
        obj.inputs[j] = undefined;
    }
    getDisplayName() {
        return "IOObject";
    }
    writeTo(node, uid) {
        createTextElement(node, "uid", uid);
        createTextElement(node, "x", this.getPos().x);
        createTextElement(node, "y", this.getPos().y);
        createTextElement(node, "angle", this.getAngle());
    }
}
