class SplitWireAction {
    constructor(wire) {
        this.context = getCurrentContext();
        this.wireport = wire.connection;
        this.wire = wire;
        this.newwire = this.wireport.connection;
        this.connection = this.newwire.connection;
    }
    undo() {
        var index1 = this.context.getIndexOf(this.wireport);
        this.context.getObjects().splice(index1, 1);
        var index2 = this.context.getIndexOf(this.newwire);
        this.context.getWires().splice(idnex2, 1);
        this.wire.disconnect(wireport);
        this.newwire.disconnect(this.connection);
        this.wire.connect(this.connection);
    }
    redo() {
        this.context.getObjects().push(this.wireport);
        this.context.getWires().push(this.oldwire);
        this.wire.disconnect(this.connection);
        this.wire.connect(this.wireport);
        this.newwire.connect(this.connection);
    }
}
