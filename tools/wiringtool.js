class WiringTool extends Tool {
    constructor() {
        super();
        this.wire = undefined;
    }
    activate(object, index) {
        super.activate();
        this.wire = new Wire(object, object.connections.length);
        object.connect(this.wire, index);
    }
    deactivate() {
        super.deactivate();
        this.wire = undefined;
    }
    removeWire() {
        var j;
        for (var j = 0; j < wires.length && wires[j] !== this.wire; j++);
        wires.splice(j, 1);
        this.wire.inputs[0].disconnect(this.wire);
    }
    onMouseMove() {
        this.wire.curve.update(this.wire.curve.p1, worldMousePos, this.wire.curve.c1, worldMousePos);
        render();
    }
    onClick() {
        for (var i = 0; i < objects.length; i++) {
            var ii;
            if ((ii = objects[i].iPortContains(worldMousePos)) !== -1) {
                if (!this.wire.connect(objects[i], ii))
                    this.removeWire();

                selectionTool.activate();
                render();
                return;
            }
        }

        this.removeWire();
        selectionTool.activate();
        render();
    }
}
