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
        this.propogationQueue.push(new Propogation(sender, receiver, signal, () => this.update(sender, receiver)));//() => this.update()));
    }
    update(sender, receiver) {
        var tempQueue = [];
        while (this.propogationQueue.length > 0)
            tempQueue.push(this.propogationQueue.pop());

        while (tempQueue.length > 0)
            tempQueue.pop().send();

        if (this.propogationQueue.length > 0)
            updateRequests++;

        updateRequests--;

        // See if the sender/receiver is a wire in the scene (not in an IC) to render
        var inScene = false;
        for (var i = 0; i < this.wires.length; i++) {
            if (this.wires[i] === sender || this.wires[i] === receiver) {
                inScene = true;
                break;
            }
        }

        if (inScene)
            this.render();

        if (updateRequests > 0) {
            setTimeout(() => this.update(sender, receiver), dt);
        }
    }
    render() {
        console.log("RENDER");

        this.renderer.clear();

        var step = GRID_SIZE/this.camera.zoom;

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

        // Check if object is on the screen before drawing
        var p1 = this.camera.getWorldPos(V(0, 0));
        var p2 = this.camera.getWorldPos(V(this.renderer.canvas.width, this.renderer.canvas.height));
        var screen = new Transform(p2.add(p1).scale(0.5), p2.sub(p1), 0, this.camera);
        for (var i = 0; i < this.objects.length; i++) {
            var obj = this.objects[i];
            var t = obj.getCullBox();

            // this.renderer.save();
            // t.transformCtx(this.renderer.context);
            // this.renderer.rect(0, 0, t.size.x, t.size.y, '#ff00ff');
            // this.renderer.restore();

            if (transformContains(t, screen)) {
                obj.draw();
            }
        }

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
