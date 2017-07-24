class WireTool extends Tool {
    constructor() {
        super();
        this.wire = undefined;
        this.t = -1;
        this.moved = false;
        this.split = false;
        this.startPos = undefined;
    }
    activate(input) {
        var wires = input.parent.getWires();
        var worldMousePos = input.worldMousePos;

        // Check if a wire was pressed
        for (var i = 0; i < wires.length; i++) {
            var wire = wires[i];
            var t;
            if ((t = wire.getNearestT(worldMousePos.x, worldMousePos.y)) !== -1) {
                console.log("Activate! " + wire.curve.getDist(t, worldMousePos.x, worldMousePos.y) + " : " + t);
                this.wire = wire;
                this.t = t;
                this.split = this.shouldSplit(worldMousePos);
                this.moved = false;
                this.startPos = (this.split) ? (undefined) : (wire.curve.p2.copy());
                super.activate();
                return;
            }
        }
    }
    onMouseMove(input) {
        var worldMousePos = input.worldMousePos;

        // Split and push to history
        if (this.split && !this.moved) {
            var action = new PressWireAction(this.wire);
            getCurrentContext().addAction(action);
            this.wire.press(this.t);
            this.startPos = this.wire.curve.p2.copy();
        }
        this.moved = true;

        this.wire.move(worldMousePos.x, worldMousePos.y);
        return true;
    }
    onMouseUp(input) {
        // Push the wire-moving to history
        if (this.moved) {
            var p0 = this.startPos;
            var p1 = this.wire.curve.p2.copy();
            var action = new MoveWireConnectionAction(this.wire, p0, p1);
            getCurrentContext().addAction(action);
        }
        // Select wire
        else {
            console.log("selected wire");
            // selectionTool.select(this.wire);
        }
        selectionTool.activate();
    }
    shouldSplit(pos) {
        var wire = this.wire;
        var t = this.t;

        // Check if mouse is close enough to an endpoint
        // that we should move that endpoint instead of
        // creating a new one
        var dist1 = wire.getPos(0).sub(pos).len2();
        var dist2 = wire.getPos(1).sub(pos).len2();
        if ((t <  0.5 && wire.input      instanceof Wire && dist1 < 100) ||
            (t >= 0.5 && wire.connection instanceof Wire && dist2 < 100)) {
            this.pressedWire = (t >= 0.5 ? wire : wire.input);
            return false;
        }
        return true;
    }
}
