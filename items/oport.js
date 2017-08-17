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
        for (var i = 0; i < this.connections.length; i++)
            this.disconnect(this.connections[i]);
    }
    connect(wire) {
        this.connections.push(wire);
        wire.input = this;
        wire.onTransformChange();
        wire.activate(this.isOn);
        return true;
    }
    disconnect(obj) {
        for (var i = 0; (i < this.connections.length) && (this.connections[i] !== obj); i++);
        this.connections[i].input = undefined;
        this.connections.splice(i, 1);
    }
    getDisplayName() {
        return "oport";
    }
}
