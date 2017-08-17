class IPort extends IOPort {
    constructor(parent) {
        super(parent, V(-1, 0))
    }
    getArray() {
        return this.parent.inputs;
    }
    set input(obj) {
        if (obj == undefined)
            this.connections = [];
        else
            this.connections[0] = obj;
    }
    get input() {
        if (this.connections.length > 0)
            return this.connections[0];
        else
            return undefined;
    }
    activate(on) {
        if (this.isOn === on)
            return;

        this.isOn = on;
        this.parent.context.propogate(this, this.parent, this.isOn);
    }
    remove() {
        if (this.input != undefined)
            this.input.disconnect(this);
    }
    getDisplayName() {
        return "iport";
    }
}
