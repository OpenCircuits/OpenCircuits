class OPort extends IOPort {
    constructor(parent) {
        super(parent, V(1, 0));
    }
    getArray() {
        return this.parent.outputs;
    }
    activate(on) {
        if (this.isOn === on)
            return;

        this.isOn = on;
        for (var i = 0; i < this.connections.length; i++)
            this.parent.context.propogate(this, this.connections[i], this.isOn);
    }
    remove() {
        for (var i = 0; i < this.connections.length; i++) {
            var obj = this.connections[i];
            obj.remove();
            // do {
            //     obj.remove();
            //     obj = obj.connection;
            // } while (obj != undefined && !(obj instanceof IPort));
        }
    }
    connect(wire) {
        this.connections.push(wire);
        wire.input = this;
        wire.onTransformChange();
        wire.activate(this.isOn);
    }
    disconnect(obj) {
        for (var i = 0; (i < this.connections.length) && (this.connections[i] !== obj); i++);
        this.connections[i].input = undefined;
        this.connections.splice(i, 1);
    }
    getXMLName() {
        return "oport";
    }
}
