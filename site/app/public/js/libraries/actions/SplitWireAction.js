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
        
        this.wire.disconnect();
        this.newwire.disconnect();
        
        this.wire.connect(this.connection);
    }
    redo() {
        this.context.add(this.wireport);
        this.context.add(this.newwire);
        
        this.wire.disconnect();
        
        this.wire.connect(this.wireport);
        this.newwire.connect(this.connection);
    }
}
