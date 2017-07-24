class WiringTool extends Tool {
    constructor() {
        super();

        this.wire = undefined;
    }
    onKeyUp(code, input) {
        if (code === 27)  { // Escape key
            this.removeWire(input.parent.wires);
            selectionTool.activate();
            render();
        }
    }
    activate(object, context) {
        super.activate();

        this.wire = new Wire(context, object);
        context.getWires().push(this.wire);
        object.connect(this.wire);
    }
    deactivate() {
        super.deactivate();

        this.wire = undefined;
    }
    removeWire(wires) {
        var j;
        for (var j = 0; j < wires.length && wires[j] !== this.wire; j++);
        wires.splice(j, 1);
        this.wire.input.disconnect(this.wire);
    }
    onMouseMove(input) {
        this.wire.curve.update(this.wire.curve.p1, input.worldMousePos, this.wire.curve.c1, input.worldMousePos);
        return true;
    }
    onClick(input) {
        var objects = input.parent.getObjects();
        var wires = input.parent.getWires();
        var worldMousePos = input.worldMousePos;

        for (var i = 0; i < objects.length; i++) {
            var ii;
            if ((ii = objects[i].iPortContains(worldMousePos)) !== -1) {
                if (!this.wire.connect(objects[i].inputs[ii])) {
                    this.removeWire(wires);
                } else {
                    var action = new PlaceWireAction(this.wire);
                    getCurrentContext().addAction(action);
                }

                selectionTool.activate();
                return true;
            }
        }

        this.removeWire(wires);
        selectionTool.activate();
        return true;
    }
}
