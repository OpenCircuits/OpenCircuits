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
    }
    activate(on) {
        if (this.isOn === on)
            return;

        this.isOn = on;
        for (var i = 0; i < this.connections.length; i++)
            propogationQueue.push(new Propogation(this, this.connections[i], this.isOn));
    }
    contains(pos) {
        var pos = this.parent.transform.pos.add(this.target);
        var transform = new Transform(pos, V(this.circleRadius,this.circleRadius), 0);
        return circleContains(transform, pos);
    }
    draw(i) {
        var l = -this.parent.transform.size.x/2*(i - this.parent.outputs.length/2 + 0.5);
        if (i === 0) l -= 1;
        if (i === this.parent.outputs.length-1) l += 1;

        var v = this.getPos();

        var lineCol = (this.parent.getBorderColor() === undefined ? this.lineColor : this.parent.getBorderColor());
        strokeLine(this.origin.x, this.origin.y+l, v.x, v.y+l, lineCol, this.lineWidth);

        var circleFillCol = (this.parent.getCol() === undefined ? this.circleFillColor : this.parent.getCol());
        var circleBorderCol = (this.parent.getBorderColor() === undefined ? this.circleBorderColor : this.parent.getBorderColor());
        circle(v.x, v.y+l, this.circleRadius, circleFillCol, circleBorderCol, this.circleBorderWidth);
    }
    getPos() {
        return this.target;
    }
    getDir() {
        return V(this.parent.transform.orientation.x,
                this.parent.transform.orientation.y);
    }
}
