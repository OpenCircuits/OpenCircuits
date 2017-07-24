class PressWireAction {
    constructor(wire) {
        this.context = getCurrentContext();
        this.wire = wire;
        this.connection = this.wire.connection;
    }
    undo() {
        if (this.oldwire == undefined)
            this.oldwire = this.wire.connection;
        var index = this.context.getIndexOf(this.oldwire);
        this.context.getWires().splice(index, 1);
        this.wire.disconnect(this.oldwire);
        this.oldwire.disconnect(this.connection);
        this.wire.connect(this.connection);
    }
    redo() {
        this.context.getWires().push(this.oldwire);
        this.wire.disconnect(this.connection);
        this.wire.connect(this.oldwire);
        this.oldwire.connect(this.connection);
    }
}
