class IOObject {
    constructor(context, x, y, w, h, img, isPressable, maxInputs, maxOutputs, selectionBoxWidth, selectionBoxHeight) {
        if (context == undefined)
            context = getCurrentContext();
        this.context = context;
        x = (x == undefined ? 0 : x);
        y = (y == undefined ? 0 : y)
        this.transform = new Transform(V(x, y), V(w, h), 0, context.getCamera());
        this.cullTransform = new Transform(this.transform.getPos(), V(0,0), 0, this.context.getCamera());

        this.name = this.getDisplayName();
        this.img = img;
        this.isOn = false;
        this.isPressable = isPressable;
        this.maxInputs = maxInputs;
        this.maxOutputs = maxOutputs;
        this.selected = false;

        if (this.isPressable)
            this.selectionBoxTransform = new Transform(V(x, y), V(selectionBoxWidth, selectionBoxHeight), 0, context.getCamera());

        this.outputs = [];
        this.inputs = [];

        if (maxOutputs > 0)
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
        this.onTransformChange();
    }
    onTransformChange() {
        if (this.isPressable && this.selectionBoxTransform != undefined) {
            this.selectionBoxTransform.setPos(this.transform.getPos());
            this.selectionBoxTransform.setAngle(this.transform.getAngle());
            this.selectionBoxTransform.setScale(this.transform.getScale());
        }
        this.updateCullTransform();
        for (var i = 0; i < this.inputs.length; i++)
            this.inputs[i].onTransformChange();
        for (var i = 0; i < this.outputs.length; i++)
            this.outputs[i].onTransformChange();
    }
    updateCullTransform() {
        // Find min/max points on the object
        var min = V(-this.transform.size.x/2, -this.transform.size.y/2);
        var max = V(this.transform.size.x/2, this.transform.size.y/2);
        if (this.selectionBoxTransform != undefined) {
            min.x = Math.min(-this.selectionBoxTransform.size.x/2, min.x);
            min.y = Math.min(-this.selectionBoxTransform.size.y/2, min.y);
            max.x = Math.max(this.selectionBoxTransform.size.x/2, max.x);
            max.y = Math.max(this.selectionBoxTransform.size.y/2, max.y);
        }
        for (var i = 0; i < this.inputs.length; i++) {
            var iport = this.inputs[i];
            min.x = Math.min(iport.target.x, min.x);
            min.y = Math.min(iport.target.y, min.y);
            max.x = Math.max(iport.target.x, max.x);
            max.y = Math.max(iport.target.y, max.y);
        }
        for (var i = 0; i < this.outputs.length; i++) {
            var oport = this.outputs[i];
            min.x = Math.min(oport.target.x, min.x);
            min.y = Math.min(oport.target.y, min.y);
            max.x = Math.max(oport.target.x, max.x);
            max.y = Math.max(oport.target.y, max.y);
        }
        this.cullTransform.setSize(V(max.x - min.x, max.y - min.y));
        var c = Math.cos(this.transform.getAngle());
        var s = Math.sin(this.transform.getAngle());
        var x = (min.x - (-this.cullTransform.size.x/2)) * c + (min.y - (-this.cullTransform.size.y/2)) * s;
        var y = (min.y - (-this.cullTransform.size.y/2)) * c + (min.x - (-this.cullTransform.size.x/2)) * s;
        this.cullTransform.setPos(this.transform.getPos().add(V(x, y)));
        this.cullTransform.setAngle(this.transform.getAngle());
        this.cullTransform.setScale(this.transform.getScale());
        this.cullTransform.setSize(this.cullTransform.size.add(V(2*IO_PORT_RADIUS, 2*IO_PORT_RADIUS)));
    }
    click() {
        // console.log(this);
    }
    press() {
    }
    release() {
    }
    activate(on, i) {
        if (i == undefined)
            i = 0;

        this.isOn = on;
        if (this.outputs[i] != undefined)
            this.outputs[i].activate(on);
    }
    localSpace() {
        var renderer = this.context.getRenderer();
        renderer.save();
        this.transform.transformCtx(renderer.context);
    }
    draw() {
        this.localSpace();
        for (var i = 0; i < this.inputs.length; i++)
            this.inputs[i].draw();

        for (var i = 0; i < this.outputs.length; i++)
            this.outputs[i].draw(i);

        var renderer = this.context.getRenderer();
        if (this.isPressable && this.selectionBoxTransform != undefined)
            renderer.rect(0, 0, this.selectionBoxTransform.size.x, this.selectionBoxTransform.size.y, this.getCol(), this.getBorderColor());

        if (this.img != undefined)
            renderer.image(this.img, 0, 0, this.transform.size.x, this.transform.size.y, this.getImageTint());
        renderer.restore();
    }
    remove() {
        this.context.remove(this);
        for (var i = 0; i < this.outputs.length; i++)
            this.outputs[i].remove();
        for (var i = 0; i < this.inputs.length; i++)
            this.inputs[i].remove();
    }
    contains(pos) {
        return rectContains(this.transform, pos);
    }
    sContains(pos) {
        return (!this.isPressable &&  this.contains(pos)) ||
                (this.isPressable && !this.contains(pos) && rectContains(this.selectionBoxTransform, pos));
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
    setContext(context) {
        this.context = context;
        this.transform.setCamera(this.context.getCamera());
        if (this.selectionBoxTransform != undefined)
            this.selectionBoxTransform.setCamera(this.context.getCamera());
    }
    setTransform(t) {
        this.transform = t;
        this.onTransformChange();
    }
    setPos(v) {
        this.transform.setPos(v);
        this.onTransformChange();
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
    setName(name) {
        this.name = name;
    }
    getCullBox() {
        return this.cullTransform;
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
    getPos() {
        return this.transform.pos.copy();
    }
    getAngle() {
        return this.transform.angle;
    }
    getSize() {
        return this.transform.size;
    }
    getMaxInputFieldCount() {
        return 8;
    }
    getMinInputFieldCount() {
        return 2;
    }
    getName() {
        return this.name;
    }
    getDisplayName() {
        return "IOObject";
    }
    getRenderer() {
        return this.context.getRenderer();
    }
    copy() {
        var copy = new this.constructor(this.context);
        copy.transform = this.transform.copy();
        copy.name = this.name;
        if (this.selectionBoxTransform != undefined)
            copy.selectionBoxTransform = this.selectionBoxTransform.copy();
        for (var i = 0; i < this.inputs.length; i++) {
            copy.inputs[i] = this.inputs[i].copy();
            copy.inputs[i].parent = copy;
        }
        for (var i = 0; i < this.outputs.length; i++) {
            copy.outputs[i] = this.outputs[i].copy();
            copy.outputs[i].parent = copy;
        }
        return copy;
    }
    writeTo(node) {
        var objNode = createChildNode(node, this.constructor.getXMLName());
        createTextElement(objNode, "uid", this.uid);
        createTextElement(objNode, "name", this.getName());
        createTextElement(objNode, "x", this.getPos().x);
        createTextElement(objNode, "y", this.getPos().y);
        createTextElement(objNode, "angle", this.getAngle());
        return objNode;
    }
    load(node) {
        var uid = getIntValue(getChildNode(node, "uid"));
        var name = getStringValue(getChildNode(node, "name"));
        var x = getFloatValue(getChildNode(node, "x"));
        var y = getFloatValue(getChildNode(node, "y"));
        var angle = getFloatValue(getChildNode(node, "angle"));
        var isOn = getBooleanValue(getChildNode(node, "isOn"), false);
        this.uid = uid;
        this.setName(name);
        if (isOn)
            this.click(isOn);
        this.setPos(V(x, y));
        this.setAngle(angle);
        return this;
    }
}
