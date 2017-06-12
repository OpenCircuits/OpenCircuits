class CircuitDesigner {
    constructor(canvas, vw, vh) {
        this.renderer = new Renderer(this, canvas, vw, vh);
        this.camera = new Camera(this);
        this.input = new Input(this);

        this.wires = [];
        this.objects = [];

        this.propogationQueue = [];
    }
    propogate(sender, receiver, signal) {
        let self = this;
        this.propogationQueue.push(new Propogation(sender, receiver, signal, () => this.update()));//() => this.update()));
    }
    update() {
        console.log("UPDATE");

        var tempQueue = [];
        while (this.propogationQueue.length > 0)
            tempQueue.push(this.propogationQueue.pop());

        while (tempQueue.length > 0)
            tempQueue.pop().send();

        if (this.propogationQueue.length > 0)
            updateRequests++;

        updateRequests--;

        this.render();

        if (updateRequests > 0) {
            setTimeout(() => this.update(), dt);
        }
    }
    render() {
        console.log("RENDER");

        this.renderer.clear();

        var step = 50/this.camera.zoom;

        var cpos = V(this.camera.pos.x/this.camera.zoom - this.renderer.canvas.width/2, this.camera.pos.y/this.camera.zoom - this.renderer.canvas.height/2);

        var cpx = cpos.x - Math.floor(cpos.x / step) * step;
        if (cpx < 0) cpx += step;
        var cpy = cpos.y - Math.floor(cpos.y / step) * step;
        if (cpy < 0) cpy += step;

        for (var x = -cpx; x <= this.renderer.canvas.width-cpx+step; x += step) {
            this.renderer.line(x, 0, x, this.renderer.canvas.height, '#999', 1 / this.camera.zoom);
        }
        for (var y = -cpy; y <= this.renderer.canvas.height-cpy+step; y += step) {
            this.renderer.line(0, y, this.renderer.canvas.width, y, '#999', 1 / this.camera.zoom);
        }

        for (var i = 0; i < this.wires.length; i++)
            this.wires[i].draw();

        for (var i = 0; i < this.objects.length; i++)
            this.objects[i].draw();

        currentTool.draw(this.renderer);
    }
    addObject(o) {
        this.objects.push(o);
    }
    addWire(w) {
        this.wires.push(w);
    }
    getRenderer() {
        return this.renderer;
    }
    getObjects() {
        return this.objects;
    }
    getWires() {
        return this.wires;
    }
    getIndexOfObject(obj) {
        for (var i = 0; i < this.objects.length; i++) {
            if (obj === this.objects[i])
                return i;
        }
        return -1;
    }
    getIndexOfWire(wire) {
        for (var i = 0; i < this.wires.length; i++) {
            if (wire === this.wires[i])
                return i;
        }
        return -1;
    }
}
