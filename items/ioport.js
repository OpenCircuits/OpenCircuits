class IOPort {
    constructor(parent, dir) {
        this.isOn = false;
        this.parent = parent;
        this.connections = [];

        this.lineColor = DEFAULT_BORDER_COLOR;

        this.origin = V(0, 0);
        this.target = dir.scale(IO_PORT_LENGTH);
        this.dir = dir;

        this.set = false;

        if (parent != undefined)
            this.updatePosition();
    }
    getArray() {
    }
    getIndex() {
        for (var i = 0; (i < this.getArray().length) && (this.getArray()[i] !== this); i++);
        return i;
    }
    updatePosition() {
        var i = this.getIndex();

        var l = -this.parent.transform.size.y/2*(i - this.getArray().length/2 + 0.5);
        if (i === 0) l -= 1;
        if (i === this.getArray().length-1) l += 1;

        this.origin.y = l;
        this.target.y = l;
        this.prevParentLength = this.getArray().length;
    }
    onTransformChange() {
        if (!this.set)
            this.updatePosition();

        for (var i = 0; i < this.connections.length; i++) {
            if (this.connections[i] != undefined)
                this.connections[i].onTransformChange();
        }
    }
    activate(on) {
    }
    contains(pos) {
        var transform = new Transform(this.target, V(IO_PORT_RADIUS, IO_PORT_RADIUS).scale(1.5), 0, this.parent.context.getCamera());
        transform.setParent(this.parent.transform);
        return circleContains(transform, pos);
    }
    sContains(pos) {
        if (this.origin.y !== this.target.y)
            return false;

        var w = Math.abs(this.target.x - this.origin.x);
        var pos2 = this.target.add(this.origin).scale(0.5);
        var transform = new Transform(pos2, V(w, IO_PORT_LINE_WIDTH*2), 0, this.parent.context.getCamera());
        transform.setParent(this.parent.transform);
        return rectContains(transform, pos);
    }
    draw() {
        if (!this.set && this.getArray().length !== this.prevParentLength)
            this.updatePosition();

        var o = this.origin;
        var v = this.target;
        var renderer = this.parent.getRenderer();

        var lineCol = (this.parent.getBorderColor() ? this.parent.getBorderColor() : this.lineColor);
        renderer.line(o.x, o.y, v.x, v.y, lineCol, IO_PORT_LINE_WIDTH);

        var circleFillCol = (this.parent.getCol() ? this.parent.getCol() : DEFAULT_FILL_COLOR);
        var circleBorderCol = (this.parent.getBorderColor() ? this.parent.getBorderColor() : DEFAULT_BORDER_COLOR);
        renderer.circle(v.x, v.y, IO_PORT_RADIUS, circleFillCol, circleBorderCol, IO_PORT_BORDER_WIDTH);
    }
    remove() {
    }
    setOrigin(v) {
        this.origin.x = v.x;
        this.origin.y = v.y;
        this.set = true;
        this.parent.onTransformChange();
    }
    setTarget(v) {
        this.target.x = v.x;
        this.target.y = v.y;
        this.set = true;
        this.parent.onTransformChange();
    }
    getPos() {
        return this.parent.transform.getMatrix().mul(this.target);
    }
    getOPos() {
        return this.parent.transform.getMatrix().mul(this.origin);
    }
    getDir() {
        return this.parent.transform.getMatrix().mul(this.dir).sub(this.parent.getPos()).normalize();
    }
    get uid() {
        return this.parent.uid;
    }
    getXMLName() {
        return "ioport";
    }
    copy() {
        var port = new this.constructor();
        port.origin = this.origin.copy();
        port.target = this.target.copy();
        port.set = this.set;
        port.lineColor = this.lineColor;
        return port;
    }
    writeTo(node) {
        var ioPortNode = createChildNode(node, this.getXMLName());
        createTextElement(ioPortNode, "originx", this.origin.x);
        createTextElement(ioPortNode, "originy", this.origin.y);
        createTextElement(ioPortNode, "targetx", this.target.x);
        createTextElement(ioPortNode, "targety", this.target.y);
    }
}
