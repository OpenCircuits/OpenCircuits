class MoveWireConnectionAction {
    constructor(wire, p0, p1) {
        this.context = getCurrentContext();
        this.wire = wire;
        this.p0 = p0;
        this.p1 = p1;
    }
    undo() {
        this.wire.move(this.p0.x, this.p0.y);
    }
    redo() {
        this.wire.move(this.p1.x, this.p1.y);
    }
}
