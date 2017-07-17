class PlaceWireAction {
    constructor(wire) {
        this.context = getCurrentContext();
        this.wire = wire;
    }
    undo() {
        if (this.input === undefined)
            this.input = this.wire.input;
        if (this.connection === undefined)
            this.connection = this.wire.connection;
        var index = this.context.getIndexOf(this.wire);
        this.context.getWires().splice(index, 1);
        this.wire.disconnect(this.wire.connection);
        this.wire.input.disconnect(this.wire);
    }
    redo() {
        this.context.getWires().push(this.wire);
        this.wire.connect(this.connection);
        this.input.connect(this.wire);
    }
}
