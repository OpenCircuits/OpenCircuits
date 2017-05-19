class IPort {
    constructor(parent) {
        this.isOn = false;
        this.parent = parent;
        this.input = undefined;

        this.lineWidth = 2;
        this.lineColor = '#000';

        this.circleRadius = 7;
        this.circleBorderWidth = 1;
        this.circleFillColor = '#fff';
        this.circleBorderColor = '#000';

        this.origin = V(0, 0);
        this.target = V(-IO_PORT_LENGTH, 0);

        this.set = false;

        this.updatePosition();
    }
    getIndexOfParent() {
        var i;
        for (i = 0; (i < this.parent.inputs.length) && (this.parent.inputs[i] !== this); i++);
        return i;
    }
    updatePosition() {
        var i = this.getIndexOfParent();

        var l = -this.parent.transform.size.y/2*(i - this.parent.inputs.length/2 + 0.5);
        if (i === 0) l -= 1;
        if (i === this.parent.inputs.length-1) l += 1;

        this.origin.y = l;
        this.target.y = l;
        this.prevParentInputLength = this.parent.inputs.length;
    }
    onTransformChange() {
        if (!this.set)
            this.updatePosition();

        if (this.input !== undefined) {
            var v = this.getPos();
            var x = v.x, y = v.y;
            this.input.curve.c2.x += x - this.input.curve.p2.x;
            this.input.curve.c2.y += y - this.input.curve.p2.y;
            this.input.curve.p2.x = x;
            this.input.curve.p2.y = y;
        }
    }
    activate(on) {
        if (this.isOn === on)
            return;

        this.isOn = on;
        this.parent.activate(this.isOn);
    }
    contains(pos) {
        var transform = new Transform(this.target, V(this.circleRadius, this.circleRadius).scale(1.5), 0);
        transform.setParent(this.parent.transform);
        return circleContains(transform, pos);
    }
    draw() {
        if (!this.set && this.parent.inputs.length !== this.prevParentInputLength)
            this.updatePosition();

        var v = this.target;

        var lineCol = (this.parent.getBorderColor() === undefined ? this.lineColor : this.parent.getBorderColor());
        strokeLine(this.origin.x, this.origin.y, v.x, v.y, lineCol, this.lineWidth);

        var circleFillCol = (this.parent.getCol() === undefined ? this.circleFillColor : this.parent.getCol());
        var circleBorderCol = (this.parent.getBorderColor() === undefined ? this.circleBorderColor : this.parent.getBorderColor());
        circle(v.x, v.y, this.circleRadius, circleFillCol, circleBorderCol, this.circleBorderWidth);
    }
    remove() {
        if (this.input !== undefined)
            this.input.remove();
        this.input = undefined;
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
        return this.parent.transform.getMatrix().mul(V(-1, 0)).sub(this.parent.getPos()).normalize();
    }
}
