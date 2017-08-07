class SplitWireAction extends Action {
    constructor(wire) {
        super();
        this.wireport = wire.connection;
        this.wire = wire;
        this.newwire = this.wireport.connection;
        this.connection = this.newwire.connection;
    }
    undo() {
        var index1 = this.context.getIndexOf(this.wireport);
        this.context.getObjects().splice(index1, 1);
        var index2 = this.context.getIndexOf(this.newwire);
        this.context.getWires().splice(index2, 1);
        this.wire.disconnect(this.wireport);
        this.newwire.disconnect(this.connection);
        this.wire.connect(this.connection);
        if (this.wireport.selected)
            selectionTool.deselect();
    }
    redo() {
        this.context.getObjects().push(this.wireport);
        this.context.getWires().push(this.newwire);
        this.wire.disconnect(this.connection);
        this.wire.connect(this.wireport);
        this.newwire.connect(this.connection);
    }
}
