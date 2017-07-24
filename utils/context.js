
class Context {
    constructor(designer) {
        this.designer = designer;
    }
    reset() {
        this.designer.reset();
    }
    render() {
        this.designer.render();
    }
    propogate(sender, receiver, signal) {
        this.designer.propogate(sender, receiver, signal);
    }
    addObject(o) {
        this.designer.addObject(o);
    }
    addWire(w) {
        this.designer.addWire(w);
    }
    addAction(action) {
        this.designer.history.add(action);
    }
    undo() {
        this.designer.history.undo();
    }
    redo() {
        this.designer.history.redo();
    }
    getDesigner() {
        return this.designer;
    }
    getRenderer() {
        return this.designer.renderer;
    }
    getCamera() {
        return this.designer.camera;
    }
    getInput() {
        return this.designer.input;
    }
    getObjects() {
        return this.designer.objects;
    }
    getWires() {
        return this.designer.wires;
    }
    getIndexOf(o) {
        if (o instanceof Wire)
            return this.designer.getIndexOfWire(o);
        else
            return this.designer.getIndexOfObject(o);
    }
    findByUID(uid) {
        var obj = findObjectByUID(uid);
        if (obj == undefined)
            obj = findWireByUID(uid);
        return obj;
    }
    findObjectByUID(uid) {
        for (var i = 0; i < this.designer.objects.length; i++) {
            if (this.designer.objects[i].uid === uid)
                return this.designer.objects[i];
        }
        return undefined;
    }
    findWireByUID(uid) {
        for (var i = 0; i < this.designer.wires.length; i++) {
            if (this.designer.wires[i].uid === uid)
                return this.designer.wires[i];
        }
        return undefined;
    }
    getWorldMousePos() {
        return this.designer.input.worldMousePos;
    }
}

function getCurrentContext() {
    return currentContext;
}
