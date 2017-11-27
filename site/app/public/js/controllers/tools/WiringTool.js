class WiringTool extends Tool {
    constructor() {
        super();

        this.clickOPort = false;
        this.wire = undefined;
    }
    onKeyUp(code, input) {
        if (code === ESC_KEY)  {
            this.removeWire(input.parent.wires);
            selectionTool.activate();
            render();
        }
    }
    activate(object, context) {
        super.activate();

        this.wire = new Wire(context);
        this.clickOPort = (object instanceof OPort);
        if (this.clickOPort)
            object.connect(this.wire);
        else
            this.wire.connect(object);
        this.onMouseMove(context.getInput());
        context.addWire(this.wire);
    }
    deactivate() {
        super.deactivate();

        this.wire = undefined;
    }
    removeWire(wires) {
        var j;
        for (var j = 0; j < wires.length && wires[j] !== this.wire; j++);
        wires.splice(j, 1);
        if (this.clickOPort)
            this.wire.input.disconnect(this.wire);
        else
            this.wire.disconnect();
    }
    onMouseMove(input) {
        if (this.clickOPort)
            this.wire.curve.update(this.wire.curve.p1, input.worldMousePos, this.wire.curve.c1, input.worldMousePos);
        else
            this.wire.curve.update(context.getInput().worldMousePos, this.wire.curve.p2, context.getInput().worldMousePos, this.wire.curve.c2);
        return true;
    }
    onClick(input) {
        var objects = input.parent.getObjects();
        var wires = input.parent.getWires();
        var worldMousePos = input.worldMousePos;

        for (var i = 0; i < objects.length; i++) {
            var ii = -1;
            if (this.clickOPort && (ii = objects[i].iPortContains(worldMousePos)) !== -1) {
                if (!this.wire.connect(objects[i].inputs[ii]))
                    this.removeWire(wires);
            }
            if (!this.clickOPort && (ii = objects[i].oPortContains(worldMousePos)) !== -1) {
                if (!objects[i].outputs[ii].connect(this.wire))
                    this.removeWire(wires);
            }
            if (ii !== -1) {
                var action = new PlaceWireAction(this.wire);
                getCurrentContext().addAction(action);

                selectionTool.activate();
                return true;
            }
         }

        this.removeWire(wires);
        selectionTool.activate();
        return true;
    }
}
var wiringTool = new WiringTool();