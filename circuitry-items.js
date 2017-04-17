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



/*

    IO PORT

*/
class IOPort extends IOObject {
    constructor(x, y, size, isOn, isPressable, maxInputs, maxOutputs) {
        super()
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
        this.curve = new BezierCurve(p, V(0,0), c, V(0,0));

        wires.push(this);
    }
    setAngle(theta) {
    }
    click() {

    }
    press(t) {
        var wire = new Wire(this, 0);
        var obj = this.connections[0];
        this.disconnect(obj);

        wire.connect(obj);
        this.connect(wire);

        // var p = wire.getInputPos(0);
        // var c = wire.getInputDir(0).scale(50).add(p);
        // this.curve.update(this.curve.p1, p, this.curve.c1, c);
    }
    draw() {
        this.curve.draw(this.isOn ? '#3cacf2' : '#fff', 7 / camera.zoom);
        // this.curve.debugDraw();
        if (this.inputs[0] instanceof Wire) {
            circle(this.curve.p1.x, this.curve.p1.y, 7, '#fff', '#000', 1);
        }
    }
    move(x, y) {
        console.log(this.curve);
        console.log(this.connections[0].curve);
        this.curve.c2.x += x - this.curve.p2.x;
        this.curve.c2.y += y - this.curve.p2.y;
        this.curve.p2.x = x;
        this.curve.p2.y = y;
        this.connections[0].curve.c2.x += x - this.connections[0].curve.p1.x;
        this.connections[0].curve.c2.y += y - this.connections[0].curve.p1.y;
        this.connections[0].curve.p1.x = this.curve.p2.x;
        this.connections[0].curve.p1.y = this.curve.p2.y;
    }
    contains(pos) {
        return this.curve.getNearestT(pos.x,pos.y) !== -1;
    }
    getInputPos(i) {
        return this.curve.getPos(0);
    }
    getInputDir(i) {
        return V(0,0);//this.curve.getVel(0).normalize().scale(-1);
    }
    getOutputPos(t) {
        return this.curve.getPos(t);
    }
    getOutputDir(t) {
        return V(0,0);//this.curve.getVel(1).normalize();
    }
    connect(obj, index) {
        if (super.connect(obj, index)) {

            // var indx;
            // for (indx = 0; indx < this.connections.length && this.connections[i] !== this; indx++);

            var p = obj.getInputPos(index);
            var c = obj.getInputDir(index).scale(50).add(p);

            this.curve.update(this.curve.p1, p, this.curve.c1, c);
            return true;
        }
        return false;
    }
    getDisplayName() {
        return "Wire";
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
        rect(this.x, this.y-this.size, this.connectorWidth, 2*this.size, this.getCol(), this.getBorderColor(), 0);
        circle(this.x, this.y, 7, this.getCol(), this.getBorderColor(), 1);
        drawImage(images["img-led.svg"], this.x, this.y-2*this.size, this.size, this.size, this.color);
        if (this.isOn)
            drawImage(images["img-ledLight.svg"], this.x, this.y-2*this.size, 3*this.size, 3*this.size, this.color);
    }
    contains(pos) {
        return contains(this.x, this.y-this.size*2, this.size/2, this.size, pos);
    }
    setPos(v) {
        super.setPos(V(v.x, v.y+2*this.size));
    }
    getInputPos(i) {
        return V(this.x, this.y);
    }
    getPos() {
        return V(this.x, this.y-2*this.size);
    }
    getOutputPortCount() {
        return 0;
    }
    getDisplayName() {
        return "LED";
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
        ioPort(this.x, this.y, outV.x, outV.y, this.getCol(), this.getBorderColor(), 7);
        drawImage(images["img-constLow.svg"], this.x, this.y, this.size, this.size, this.getCol());
    }
    getInputPortCount() {
        return 0;
    }
    getDisplayName() {
        return "Constant Low";
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
        ioPort(this.x, this.y, outV.x, outV.y, this.getCol(), this.getBorderColor(), 7);
        drawImage(images["img-constHigh.svg"], this.x, this.y, this.size, this.size, this.getCol());
    }
    getInputPortCount() {
        return 0;
    }
    getDisplayName() {
        return "Constant High";
    }
}
class Button extends IOObject {
    constructor(x, y) {
        super(x, y, 50, false, true, 0, 999);
        this.curPressed = false;
    }
    getPos() {
        return V(this.x, this.y);
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
        ioPort(this.x, this.y, outV.x, outV.y, this.getCol(), this.getBorderColor(), 7);
        rect(this.x, this.y, this.size, this.size, this.getCol(), this.getBorderColor());
        drawImage(images[this.isOn ? "img-buttonDown.svg" : "img-buttonUp.svg"], this.x, this.y, this.size, this.size, this.getCol());
    }
    contains(pos) {
        return circleContains(this.getPos(), this.size/2, pos);
    }
    sContains(pos) {
        return contains(this.x, this.y, this.size, this.size, pos) && !this.contains(pos);
    }
    getInputPortCount() {
        return 0;
    }
    getDisplayName() {
        return "Button";
    }
}
class Switch extends IOObject {
    constructor(x, y) {
        super(x, y, 60, false, true, 0, 999);
    }
    click() {
        this.activate(!this.isOn);
    }
    draw() {
        super.draw();
        var outV = this.getOutputPos();
        ioPort(this.x, this.y, outV.x, outV.y, this.getCol(), this.getBorderColor(), 7);
        rect(this.x, this.y, this.size*5/6, this.size, this.getCol(), this.getBorderColor());
        drawImage(images[this.isOn ? "img-switchDown.svg" : "img-switchUp.svg"], this.x, this.y, this.size, this.size, this.getCol());
    }
    contains(pos) {
        return contains(this.x, this.y+this.size/14, this.size*3/5, this.size*5/7, pos);
    }
    sContains(pos) {
        return contains(this.x, this.y, this.size*5/6, this.size, pos) && !this.contains(pos);
    }
    getInputPortCount() {
        return 0;
    }
    getDisplayName() {
        return "Switch";
    }
}



/*

    GATES

*/
class Gate extends IOObject {
    constructor(x, y, startInputs, size, img, not) {
        super(x, y, size, false, true, 999, 999);
        this.img = img;
        this.not = not;
        this.setInputAmount(startInputs);
    }
    getPos() {
        return V(this.x, this.y);
    }
    setInputAmount(x) {
        while (this.inputs.length > x)
            this.inputs.splice(this.inputs.length-1, 1);
        while (this.inputs.length < x)
            this.inputs.push(undefined);
    }
    click() {
        console.log("ASD");
    }
    activate(on) {
        super.activate((this.not ? !on : on));
    }
    draw() {
        super.draw();
        var outV = this.getOutputPos();
        ioPort(this.x, this.y, outV.x, outV.y, this.getCol(), this.getBorderColor());
        for (var i = 0; i < this.inputs.length; i++) {
            var inV = this.getInputPos(i);

            var l = -this.size/2*(i - this.inputs.length/2 + 0.5);
            if (i === 0) l -= 1;
            if (i === this.inputs.length-1) l += 1;
            ioPort(l*this.orientation.y+this.x-this.size/2*this.orientation.x, l*this.orientation.x+this.y+this.size/2*this.orientation.y, inV.x, inV.y, this.getCol(), this.getBorderColor());
        }

        var w = this.size*this.img.width/this.img.height;
        var l = (w - this.size)/2;

        drawRotatedImage(this.img, this.x-l*this.orientation.x, this.y+l*this.orientation.y, w, this.size, this.getAngle(), this.getCol());

        if (this.not) {
            var l = this.size/2+5/2;
            circle(this.x+l*this.orientation.x, this.y-l*this.orientation.y, 5, this.getCol(), this.getBorderColor(), 2 / camera.zoom);
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
    getDisplayName() {
        return "Gate";
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
    getDisplayName() {
        return this.not ? "NOT Gate" : "Buffer Gate";
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

        strokeLine(p1.x, p1.y, p2.x, p2.y, this.getBorderColor(), 2/camera.zoom);
    }
    getDisplayName() {
        return this.not ? "NAND Gate" : "AND Gate";
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
    getDisplayName() {
        return this.not ? "NOR Gate" : "OR Gate";
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
    getDisplayName() {
        return this.not ? "XNOR Gate" : "XOR Gate";
    }
}
