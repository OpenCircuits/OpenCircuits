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

        this.pressedShift = false;
        this.wire = new Wire(context);
        this.clickOPort = (object instanceof OPort);
        var success;

        // create two straight line wires
        if (Input.getShiftKeyDown()) {
            this.wireVertical = new Wire(context);
            this.wireport     = new WirePort(context);
            this.pressedShift = true;

            if (this.clickOPort) {
                success = object.connect(this.wireVertical);
                this.wireVertical.connect(this.wireport);
                this.wireport.connect(this.wire);
            } else {
                success = this.wireVertical.connect(object);
                this.wireport.connect(this.wireVertical);
                this.wire.connect(this.wireport);
            }
            this.wireport.setPos(V(object.getPos().x, Input.getWorldMousePos().y));
            if (success) {
                this.onMouseMove();
                context.addWire(this.wire);
                context.addWire(this.wireVertical);
                context.addObject(this.wireport);
            } else { // Illegal connection (ex. two inputs to IPort)
                selectionTool.activate();
            }
        }
        // create single curve wire
        else {
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
    }
    deactivate() {
        super.deactivate();

        this.wire = undefined;
    }
    removeWire() {
        if (Input.getShiftKeyDown()) {
            getCurrentContext().remove(this.wire);
            getCurrentContext().remove(this.wireVertical);
            getCurrentContext().remove(this.wireport);
            if (this.clickOPort)
                this.wireVertical.input.disconnect(this.wireVertical);
            else
                this.wireVertical.disconnect();
        }
        else {
            getCurrentContext().remove(this.wire);
            if (this.clickOPort)
                this.wire.input.disconnect(this.wire);
            else
                this.wire.disconnect();
        }
    }
    onMouseMove() {
        if (this.pressedShift) {
            if (this.clickOPort)
                this.wireport.setPos(V(this.wireport.getPos().x, Input.getWorldMousePos().y));
            else
                this.wireport.setPos(V(Input.getWorldMousePos().x, this.wireport.getPos().y));
        }
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
            // places wire and exits wiring tool
            if (ii !== -1) {
                var action = new PlaceWireAction(this.wire);
                getCurrentContext().addAction(action);
                if (this.pressedShift && this.clickOPort)
                    this.wireport.setPos(V(this.wireVertical.input.getPos().x, this.wire.connection.getPos().y));
                if (this.pressedShift && !this.clickOPort)
                    this.wireport.setPos(V(this.wire.input.getPos().x, this.wireVertical.connection.getPos().y));
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
