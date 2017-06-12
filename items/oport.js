class OPort {
    constructor(parent) {
        this.isOn = false;
        this.parent = parent;
        this.connections = [];

        this.lineWidth = 2;
        this.lineColor = '#000';

        this.circleRadius = 7;
        this.circleBorderWidth = 1;
        this.circleFillColor = '#fff';
        this.circleBorderColor = '#000';

        this.origin = V(0, 0);
        this.target = V(IO_PORT_LENGTH, 0);

        this.set = false;

        this.updatePosition();
    }
    getIndexOfParent() {
        var i;
        for (i = 0; (i < this.parent.outputs.length) && (this.parent.outputs[i] !== this); i++);
        return i;
    }
    updatePosition() {
        var i = this.getIndexOfParent();

        var l = -this.parent.transform.size.y/2*(i - this.parent.outputs.length/2 + 0.5);
        if (i === 0) l -= 1;
        if (i === this.parent.outputs.length-1) l += 1;

        this.origin.y = l;
        this.target.y = l;
        this.prevParentOutputLength = this.parent.outputs.length;
    }
    onTransformChange() {
        if (!this.set && this.parent.inputs.length !== this.prevParentInputLength)
            this.updatePosition();

        for (var i = 0; i < this.connections.length; i++) {
            var v = this.getPos();
            var x = v.x, y = v.y;
            this.connections[i].curve.c1.x += x - this.connections[i].curve.p1.x;
            this.connections[i].curve.c1.y += y - this.connections[i].curve.p1.y;
            this.connections[i].curve.p1.x = x;
            this.connections[i].curve.p1.y = y;
        }
    }
    activate(on) {
        if (this.isOn === on)
            return;

        this.isOn = on;
        for (var i = 0; i < this.connections.length; i++)
            this.parent.context.propogate(this, this.connections[i], this.isOn);
    }
    connect(obj) {
        this.connections.push(obj);
        obj.input = this;
        obj.activate(this.isOn);
    }
    disconnect(obj) {
        var i;
        for (i = 0; (i < this.connections.length) && (this.connections[i] !== obj); i++);
        this.connections[i].input = undefined;
        this.connections.splice(i, 1);
    }
    contains(pos) {
        var transform = new Transform(this.target, V(this.circleRadius, this.circleRadius).scale(1.5), 0, this.parent.context.getCamera());
        transform.setParent(this.parent.transform);
        return circleContains(transform, pos);
    }
    draw(i) {
        if (this.parent.outputs.length !== this.prevParentOutputLength)
            this.updatePosition();

        var v = this.target;
        var renderer = this.parent.getRenderer();

        var lineCol = (this.parent.getBorderColor() === undefined ? this.lineColor : this.parent.getBorderColor());
        renderer.line(this.origin.x, this.origin.y, v.x, v.y, lineCol, this.lineWidth);

        var circleFillCol = (this.parent.getCol() === undefined ? this.circleFillColor : this.parent.getCol());
        var circleBorderCol = (this.parent.getBorderColor() === undefined ? this.circleBorderColor : this.parent.getBorderColor());
        renderer.circle(v.x, v.y, this.circleRadius, circleFillCol, circleBorderCol, this.circleBorderWidth);
    }
    remove() {
        for (var i = 0; i < this.connections.length; i++) {
            this.connections[i].remove();
            this.connections[i] = undefined;
        }
        this.connections = [];
    }
    setOrigin(v) {
        this.origin.x = v.x;
        this.origin.y = v.y;
        this.set = true;
    }
    setTarget(v) {
        this.target.x = v.x;
        this.target.y = v.y;
        this.set = true;
    }
    getPos() {
        return this.parent.transform.getMatrix().mul(this.target);
    }
    getDir() {
        return this.parent.transform.getMatrix().mul(V(1, 0)).sub(this.parent.getPos()).normalize();
    }
}
