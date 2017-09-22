class SplitWireAction extends Action {
    constructor(wire) {
        super();
        this.wireport = wire.connection;
        this.wire = wire;
        this.newwire = this.wireport.connection;
        this.connection = this.newwire.connection;
    }
    undo() {
        this.context.remove(this.wireport);
        this.context.remove(this.newwire);
        this.wire.disconnect(this.wireport);
        this.newwire.disconnect(this.connection);
        this.wire.connect(this.connection);
        if (this.wireport.selected)
            selectionTool.deselect();
    }
    redo() {
        this.context.addObject(this.wireport);
        this.context.addWire(this.newwire);
        this.wire.disconnect(this.connection);
        this.wire.connect(this.wireport);
        this.newwire.connect(this.connection);
    }
}
