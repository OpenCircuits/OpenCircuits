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

        this.updatePosition();
    }
    updatePosition() {
        var i;
        for (i = 0; (i < this.parent.inputs.length) && (this.parent.inputs[i] !== this); i++);

        var l = -this.parent.transform.size.y/2*(i - this.parent.inputs.length/2 + 0.5);
        if (i === 0) l -= 1;
        if (i === this.parent.inputs.length-1) l += 1;

        this.origin.y = l;
        this.target.y = l;
        this.prevParentInputLength = this.parent.inputs.length;
    }
    contains(pos) {
        var pos = this.parent.transform.pos.add(this.target);
        var transform = new Transform(pos, V(this.circleRadius,this.circleRadius), 0);
        return circleContains(transform, pos);
    }
    draw() {
        if (this.parent.inputs.length !== this.prevParentInputLength)
            this.updatePosition();

        var v = this.getPos();

        var lineCol = (this.parent.getBorderColor() === undefined ? this.lineColor : this.parent.getBorderColor());
        strokeLine(this.origin.x, this.origin.y, v.x, v.y, lineCol, this.lineWidth);

        var circleFillCol = (this.parent.getCol() === undefined ? this.circleFillColor : this.parent.getCol());
        var circleBorderCol = (this.parent.getBorderColor() === undefined ? this.circleBorderColor : this.parent.getBorderColor());
        circle(v.x, v.y, this.circleRadius, circleFillCol, circleBorderCol, this.circleBorderWidth);
    }
    getPos() {
        return this.target;
    }
    getDir() {
        return V(-this.parent.transform.orientation.x,
                -this.parent.transform.orientation.y);
    }
}
