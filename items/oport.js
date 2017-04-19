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

        this.updatePosition();
    }
    updatePosition() {
        var i;
        for (i = 0; (i < this.parent.outputs.length) && (this.parent.outputs[i] !== this); i++);

        var l = -this.parent.transform.size.y/2*(i - this.parent.outputs.length/2 + 0.5);
        if (i === 0) l -= 1;
        if (i === this.parent.outputs.length-1) l += 1;

        this.origin.y = l;
        this.target.y = l;
        this.prevParentOutputLength = this.parent.outputs.length;
    }
    activate(on) {
        if (this.isOn === on)
            return;

        this.isOn = on;
        for (var i = 0; i < this.connections.length; i++)
            propogationQueue.push(new Propogation(this, this.connections[i], this.isOn));
    }
    connect(obj) {
        this.connections.push(obj);
        obj.input = this;
    }
    disconnect(obj) {
        var i;
        for (i = 0; (i < this.connections.length) && (this.connections[i] !== obj); i++);
        this.connections[i].input = undefined;
        this.connections.splice(i, 1);
    }
    contains(pos) {
        var mPos = this.parent.transform.pos.add(this.target);
        var transform = new Transform(mPos, V(this.circleRadius,this.circleRadius).scale(1.5), 0);
        return circleContains(transform, pos);
    }
    draw(i) {
        if (this.parent.outputs.length !== this.prevParentOutputLength)
            this.updatePosition();

        var v = this.target;

        var lineCol = (this.parent.getBorderColor() === undefined ? this.lineColor : this.parent.getBorderColor());
        strokeLine(this.origin.x, this.origin.y, v.x, v.y, lineCol, this.lineWidth);

        var circleFillCol = (this.parent.getCol() === undefined ? this.circleFillColor : this.parent.getCol());
        var circleBorderCol = (this.parent.getBorderColor() === undefined ? this.circleBorderColor : this.parent.getBorderColor());
        circle(v.x, v.y, this.circleRadius, circleFillCol, circleBorderCol, this.circleBorderWidth);
    }
    getPos() {
        return this.parent.transform.pos.add(this.target);
    }
    getDir() {
        return V(1, 0);
    }
}
