class IOObject {
    constructor(x, y, size, isOn, isPressable, maxInputs, maxOutputs) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.isOn = isOn;
        this.isPressable = isPressable;
        this.maxInputs = maxInputs;
        this.maxOutputs = maxOutputs;
        this.connections = [];
        this.inputs = [];
        this.setAngle(0);
    }
    setInputAmount(x) {
    }
    getInputAmount() {
        return this.inputs.length;
    }
    setAngle(theta) {
        this.angle = theta;
        this.orientation = V(Math.cos(this.angle), Math.sin(this.angle));
    }
    getAngle() {
        return -this.angle;
    }
    getCol() {
        return (selectionTool.selection === this ? '#1cff3e' : undefined);
    }
    getBorderColor() {
        return (selectionTool.selection === this ? '#0d7f1f' : undefined);
    }
    click() {
    }
    press() {
    }
    release() {
    }
    activate(on) {
        if (this.isOn === on)
            return;

        this.isOn = on;
        for (var i = 0; i < this.connections.length; i++)
            propogationQueue.push(new Propogation(this, this.connections[i], this.isOn));
    }
    draw() {
    }
    contains(pos) {
        return contains(this.x, this.y, this.size, this.size, pos);
    }
    sContains(pos) {
        return this.contains(pos);
    }
    iPortContains(pos) {
        var i;
        for (i = 0; i < this.getInputPortCount(); i++) {
            var p = this.getInputPos(i);
            if (circleContains(p, 7, pos))
                return i;
        }
        return -1;
    }
    oPortContains(pos) {
        var i;
        for (i = 0; i < this.getOutputPortCount(); i++) {
            var p = this.getOutputPos(i);
            if (circleContains(p, 7, pos))
                return i;
        }
        return -1;
    }
    getPos() {
        return V(this.x, this.y);
    }
    setPos(p) {
        this.x = p.x;
        this.y = p.y;
    }
    getInputPos(i) {
        return this.getPos(i);
    }
    getInputDir(i) {
        return V(-this.orientation.x, -this.orientation.y);
    }
    getInputPortCount() {
        return 1;
    }
    getOutputPos(i) {
        // return this.getPos(i);
        return V(this.x+this.orientation.x*IO_PORT_LENGTH, this.y-this.orientation.y*50);
    }
    getOutputDir(i) {
        return V(this.orientation.x, this.orientation.y);
    }
    getOutputPortCount() {
        return 1;
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
}
