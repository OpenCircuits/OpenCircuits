class WiringTool extends Tool {
    constructor() {
        super();

        this.clickOPort = false;
        this.wire = undefined;
    }
    onKeyUp(code, input) {
        if (code === ESC_KEY)  {
            this.removeWire();
            selectionTool.activate();
            render();
        }
    }
    activate(object, context) {
        super.activate();
        
        console.log(object);

        this.wire = new Wire(context);
        this.clickOPort = (object instanceof OPort);
        var success;
        if (this.clickOPort)
            success = object.connect(this.wire);
        else
            success = this.wire.connect(object);
        if (success) {
            this.onMouseMove();
            context.addWire(this.wire);
        } else { // Illegal connection (ex. two inputs to IPort)
            selectionTool.activate();
        }
    }
    deactivate() {
        super.deactivate();

        this.wire = undefined;
    }
    removeWire() {
        getCurrentContext().remove(this.wire);
        if (this.clickOPort)
            this.wire.input.disconnect(this.wire);
        else
            this.wire.disconnect();
    }
    onMouseMove() {
        if (this.clickOPort)
            this.wire.curve.update(this.wire.curve.p1, Input.getWorldMousePos(), this.wire.curve.c1, Input.getWorldMousePos());
        else
            this.wire.curve.update(Input.getWorldMousePos(), this.wire.curve.p2, Input.getWorldMousePos(), this.wire.curve.c2);
        return true;
    }
    onClick() {
        var objects = getCurrentContext().getObjects();
        var worldMousePos = Input.getWorldMousePos();

        for (var i = 0; i < objects.length; i++) {
            var ii = -1;
            if (this.clickOPort && (ii = objects[i].iPortContains(worldMousePos)) !== -1) {
                if (!this.wire.connect(objects[i].inputs[ii]))
                    this.removeWire();
            }
            if (!this.clickOPort && (ii = objects[i].oPortContains(worldMousePos)) !== -1) {
                if (!objects[i].outputs[ii].connect(this.wire))
                    this.removeWire();
            }
            if (ii !== -1) {
                var action = new PlaceWireAction(this.wire);
                getCurrentContext().addAction(action);

                selectionTool.activate();
                return true;
            }
         }

        this.removeWire();
        selectionTool.activate();
        return true;
    }
}
var wiringTool = new WiringTool();