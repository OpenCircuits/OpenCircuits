class PlaceWireAction extends Action {
    constructor(wire) {
        super();
        this.wire = wire;
        this.input = this.wire.input;
        this.connection = this.wire.connection;
    }
    undo() {
        this.context.remove(this.wire);
        this.wire.disconnect();
        this.wire.input.disconnect(this.wire);
    }
    redo() {
        this.context.add(this.wire);
        this.wire.connect(this.connection);
        this.input.connect(this.wire);
    }
}
