/*

    HELPER FUNCTIONS

*/
function contains(x, y, w, h, pos) {
    return (pos.x > x - w/2 &&
            pos.y > y - h/2 &&
            pos.x < x + w/2 &&
            pos.y < y + h/2);
}
function circleContains(pos1, r, pos2) {
    return pos2.sub(pos1).len2() <= r*r;
}

const IO_PORT_LENGTH = 60;


/*

    BASE CLASS

*/
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
    setAngle(theta) {
        this.angle = theta;
        this.orientation = V(Math.cos(this.angle), Math.sin(this.angle));
    }
    getAngle() {
        return -this.angle;
    }
    click() {
        if (!this.isPressable)
            return;
        this.activate(!this.isOn);
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
}



/*

    WIRE

*/
class Wire extends IOObject {
    constructor(host, hostIndex) {
        super(0, 0, 7, false, true, 1, 1);
        this.hostIndex = hostIndex;
        // this.inputs[0] = host;

        var p = host.getOutputPos(hostIndex);
        var c = host.getOutputDir(hostIndex).scale(50).add(p);
        this.curve = new BezierCurve(p, p, c, c);

        wires.push(this);
    }
    setAngle(theta) {
    }
    click() {

    }
    press(t) {
        var wire = new Wire(this, t);
        var obj = this.connections[0];
        this.disconnect(obj);

        wire.connect(obj);
        this.connections[0] = wire;

        var p = wire.getInputPos(0);
        var c = wire.getInputDir(0).scale(50).add(p);
        this.curve.update(this.curve.p1, p, this.curve.c1, c);
        // console.log(this.connections[0]);
        // this.connect(wire);
        // console.log(this.connections[0]);
    }
    draw() {
        this.curve.draw(this.isOn ? '#3cacf2' : '#fff', 7 / camera.zoom);
        if (this.inputs[0] instanceof Wire) {
            circle(this.curve.p1.x, this.curve.p1.y, 7, '#fff', '#000', 1);
        }
    }
    move(x, y) {
        this.curve.p2.x = x;
        this.curve.p2.y = y;
        this.connections[0].curve.p1.x = this.curve.p2.x;
        this.connections[0].curve.p1.y = this.curve.p2.y;
        // this.curve.c2 = this.getOutputDir().scale(-50);//this
        // this.connections[0].curve.c1 = this.connections[0].getInputDir();//this.inputs[0].getPos().sub(this.curve.p2).normalize();
    }
    contains(pos) {
        return this.curve.getNearestT(pos.x,pos.y) !== -1;
    }
    getInputPos(i) {
        return this.curve.getPos(0);
    }
    getInputDir(i) {
        return this.curve.getVel(0).normalize().scale(-1);
    }
    getOutputPos(t) {
        return this.curve.getPos(t);
    }
    getOutputDir(t) {
        return this.curve.getVel(1).normalize();
    }
    connect(obj, indx) {
        if (indx === undefined) {
            for (indx = 0; indx < obj.inputs.length && obj.inputs[indx] !== undefined; indx++);
            if (indx >= obj.maxInputs)
                return false;
        }
        if (obj.inputs[indx] !== undefined || this.connections[0] !== undefined)
            return false;

        this.connectionIndex = indx;
        this.connections[0] = obj;
        obj.inputs[indx] = this;

        var p = obj.getInputPos(indx);
        var c = obj.getInputDir(indx).scale(50).add(p);
        this.curve.update(this.curve.p1, p, this.curve.c1, c);

        obj.activate(this.isOn);
        return true;
    }
}



/*

    OUTPUTS

*/
class LED extends IOObject {
    constructor(x, y, color) {
        super(x, y, 50, false, false, 1, 0);
        this.color = color;
        this.connectorWidth = 5;
        this.setAngle(-Math.PI/2);
    }
    draw() {
        rect(this.x, this.y-this.size, this.connectorWidth, 2*this.size, "#ffffff");
        circle(this.x, this.y, 7, '#fff', '#000', 1);
        drawImage(images["img-led.svg"], this.x, this.y-2*this.size, this.size, this.size, this.color);
        if (this.isOn)
            drawImage(images["img-ledLight.svg"], this.x, this.y-2*this.size, 3*this.size, 3*this.size, this.color);
    }
    contains(pos) {
        return contains(this.x, this.y-2*this.size, 5, this.size*2, pos);
    }
    getPos() {
        return V(this.x, this.y);
    }
    getOutputPortCount() {
        return 0;
    }
}

// key board input inputs

/*

    INPUTS

*/
class ConstantLow extends IOObject {
    constructor(x, y) {
        super(x, y, 50, false, true, 0, 999);
        super.activate(false);
    }
    draw() {
        super.draw();
        var outV = this.getOutputPos();
        ioPort(this.x, this.y, outV.x, outV.y, 7);
        drawImage(images["img-constLow.svg"], this.x, this.y, this.size, this.size);
    }
    getInputPortCount() {
        return 0;
    }
}
class ConstantHigh extends IOObject {
    constructor(x, y) {
        super(x, y, 50, false, true, 0, 999);
        super.activate(true);
    }
    draw() {
        super.draw();
        var outV = this.getOutputPos();
        ioPort(this.x, this.y, outV.x, outV.y, 7);
        drawImage(images["img-constHigh.svg"], this.x, this.y, this.size, this.size);
    }
    getInputPortCount() {
        return 0;
    }
}
class Button extends IOObject {
    constructor(x, y) {
        super(x, y, 50, false, true, 0, 999);
        this.curPressed = false;
    }
    click() {
    }
    press() {
        super.activate(true);
        this.curPressed = true;
    }
    release() {
        super.activate(false);
        this.curPressed = false;
    }
    draw() {
        super.draw();
        var outV = this.getOutputPos();
        ioPort(this.x, this.y, outV.x, outV.y, 7);
        drawImage(images[this.isOn ? "img-buttonDown.svg" : "img-buttonUp.svg"], this.x, this.y, this.size, this.size);
    }
    getInputPortCount() {
        return 0;
    }
}
class Switch extends IOObject {
    constructor(x, y) {
        super(x, y, 80, false, true, 0, 999);
    }
    draw() {
        super.draw();
        var outV = this.getOutputPos();
        ioPort(this.x, this.y, outV.x, outV.y, 7);
        drawImage(images[this.isOn ? "img-switchDown.svg" : "img-switchUp.svg"], this.x, this.y, this.size, this.size);
    }
    getInputPortCount() {
        return 0;
    }
}



/*

    GATES

*/
class Gate extends IOObject {
    constructor(x, y, startInputs, size, img, not) {
        super(x, y, size, false, false, 999, 999);
        this.img = img;
        this.not = not;
        for (var i = 0; i < startInputs; i++)
            this.inputs.push(undefined);
    }
    activate(on) {
        super.activate((this.not ? !on : on));
    }
    draw() {
        super.draw();
        var outV = this.getOutputPos();
        ioPort(this.x, this.y, outV.x, outV.y);
        for (var i = 0; i < this.inputs.length; i++) {
            var inV = this.getInputPos(i);

            var l = -this.size/2*(i - this.inputs.length/2 + 0.5);
            if (i === 0) l -= 1;
            if (i === this.inputs.length-1) l += 1;
            ioPort(l*this.orientation.y+this.x-this.size/2*this.orientation.x, l*this.orientation.x+this.y+this.size/2*this.orientation.y, inV.x, inV.y);
        }

        var w = this.size*this.img.width/this.img.height;
        var l = (w - this.size)/2;

        drawRotatedImage(this.img, this.x-l*this.orientation.x, this.y+l*this.orientation.y, w, this.size, this.getAngle());

        if (this.not) {
            var l = this.size/2+5/2;
            circle(this.x+l*this.orientation.x, this.y-l*this.orientation.y, 5, '#fff', '#000', 2 / camera.zoom);
        }
    }
    getInputPos(i) {
        var l = this.size * 0.5 * (i - this.inputs.length/2 + 0.5);
        if (i === 0) l += 1;
        if (i === this.inputs.length-1) l -= 1;
        return V(this.x-this.orientation.x*IO_PORT_LENGTH-this.orientation.y*l, this.y+this.orientation.y*IO_PORT_LENGTH-this.orientation.x*l);
    }
    getInputPortCount() {
        return this.inputs.length;
    }
}
class BUFGate extends Gate {
    constructor(not, x, y) {
        super(x, y, 1, 50, images["img-buffer.svg"], not);
        this.maxInputs = 1;
    }
    activate(x) {
        var on = false;
        for (var i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i] !== undefined && this.inputs[i].isOn) {
                on = true;
                break;
            }
        }
        super.activate(on);
    }
}
class ANDGate extends Gate {
    constructor(not, x, y) {
        super(x, y, 2, 50, images["img-and.svg"], not);
    }
    activate(x) {
        var on = true;
        var allUndefined = true;
        for (var i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i] !== undefined)
                allUndefined = false;
            if (this.inputs[i] !== undefined && !this.inputs[i].isOn) {
                on = false;
                break;
            }
        }
        super.activate(on && !allUndefined);
    }
    draw() {
        super.draw();
        var h = 3;

        var l1 = -(this.size/2+h)*(0.5-this.inputs.length/2);
        var l2 = -(this.size/2+h)*(this.inputs.length/2-0.5);

        var s = (this.size-h+1)/2;
        var p1 = V(l1*this.orientation.y+this.x-s*this.orientation.x, l1*this.orientation.x+this.y+s*this.orientation.y);
        var p2 = V(l2*this.orientation.y+this.x-s*this.orientation.x, l2*this.orientation.x+this.y+s*this.orientation.y);

        strokeLine(p1.x, p1.y, p2.x, p2.y, '#000000', 2/camera.zoom);
    }
}
class ORGate extends Gate {
    constructor(not, x, y) {
        super(x, y, 2, 50, images["img-or.svg"], not);//(not ? images["img-nor.svg"] : images["img-or.svg"]), not);
    }
    activate(x) {
        var on = false;
        for (var i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i] !== undefined && this.inputs[i].isOn) {
                on = true;
                break;
            }
        }
        super.activate(on);
    }
    // draw() {
    //     var outV = this.getOutputPos();
    //     ioPort(this.x, this.y, outV.x, outV.y, 7);
    //     for (var i = 0; i < this.inputs.length; i++) {
    //         var inV = this.getInputPos(i);
    //
    //         var l = -this.size/2*(i - this.inputs.length/2 + 0.5);
    //         ioPort(l*this.orientation.y+this.x, l*this.orientation.x+this.y, inV.x, inV.y, 7);
    //     }
    //     var w = this.size*this.img.width/this.img.height;
    //     drawRotatedImage(this.img, this.x-(w-this.size)/2, this.y, w, this.size, this.getAngle());
    // }
}
class XORGate extends Gate {
    constructor(not, x, y) {
        super(x, y, 2, 50, images["img-or.svg"], not);
        this.setAngle(Math.PI  * 1/2);
    }
    activate(x) {
        var on = false;
        for (var i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i] !== undefined && this.inputs[i].isOn) {
                if (on === true) {
                    on = false;
                    break;
                }
                on = true;
            }
        }
        super.activate(on);
    }
    draw() {
        super.draw();
        var h = 3;
        var x = 10;

        var l1 = -(this.size/2+h)*(0.5-this.inputs.length/2);
        var l2 = -(this.size/2+h)*(this.inputs.length/2-0.5);

        var l = this.size * this.img.width / this.img.height;

        var d = l/2 + h + x;

        var p1 = V(this.x - d*this.orientation.x - this.size/2*this.orientation.y, this.y - this.size/2*this.orientation.x + d*this.orientation.y);
        var p2 = V(this.x - d*this.orientation.x + this.size/2*this.orientation.y, this.y + this.size/2*this.orientation.x + d*this.orientation.y);
        var c = V(this.x - (l/4 + h/2 + x/2)*this.orientation.x, this.y + (this.size/4 + h + x/2)*this.orientation.y);

        strokeQuadCurve(p1.x, p1.y, p2.x, p2.y, c.x, c.y, '#000000', 2/camera.zoom);
    }
}
