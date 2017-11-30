class SelectionTool extends Tool {
    constructor() {
        super();
        this.selections = [];
        this.midpoint = V(0, 0);
        this.isRotating = false;
    }
    onKeyDown(code, input) {
        console.log(code);
        // if (!icdesigner.hidden)
        //     return;

        if (code === A_KEY && Input.getModifierKeyDown()) {
            this.selectAll();
            return true;
        }
    }
    onMouseDown() {
        var objects = getCurrentContext().getObjects();
        var wires = getCurrentContext().getWires();
        var worldMousePos = Input.getWorldMousePos();

        if (!icdesigner.hidden)
            return false;

        var pressed = false;

        // Go through objects backwards since objects on top are in the back
        for (var i = objects.length-1; i >= 0; i--) {
            var obj = objects[i];

            // Check if object was pressed
            if (obj.contains(worldMousePos)) {
                if (obj.isPressable)
                    obj.press();
                return true;
            }
            
            // Ignore if object's selection box was pressed
            if (obj.sContains(worldMousePos))
                return;

            // Ignore if a port was pressed
            if (obj.oPortContains(worldMousePos) !== -1 ||
                    obj.iPortContains(worldMousePos) !== -1) {
                return;
            }
        }
    }
    onMouseMove() {
        var objects = getCurrentContext().getObjects();
        var wires = getCurrentContext().getWires();
        var worldMousePos = Input.getWorldMousePos();

        if (!icdesigner.hidden)
            return false;

        // Transform selection(s)
        if (this.selections.length > 0) {
        }
    }
    onMouseUp() {
        var objects = getCurrentContext().getObjects();
        var wires = getCurrentContext().getWires();
        var worldMousePos = Input.getWorldMousePos();

        if (!icdesigner.hidden)
            return false;

        popup.update();
        
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];

            // Release pressed object
            if (obj.isPressable && obj.isOn && !Input.isDragging) {
                obj.release();
                return true;
            }
        }
    }
    onClick() {
        var objects = getCurrentContext().getObjects();
        var wires = getCurrentContext().getWires();
        var worldMousePos = Input.getWorldMousePos();

        if (!icdesigner.hidden || Input.getIsDragging())
            return false;
            
        // Go through objects backwards since objects on top are in the back
        for (var i = objects.length-1; i >= 0; i--) {
            var obj = objects[i];

            // Check if object's selection box was clicked
            if (obj.sContains(worldMousePos)) {
                if (!Input.getShiftKeyDown())
                    this.deselectAll(true);
                this.select([obj], true);
                return true;
            }

            // Check if object was clicked
            if (obj.contains(worldMousePos)) {
                obj.click();
                return true;
            }
        }

        // Didn't click on anything so deselect everything
        // And add a deselect action
        if (!Input.getShiftKeyDown() && this.selections.length > 0) {
            this.deselectAll(true);
            return true;
        }
    }
    addTransformAction() {
        var action = new GroupAction();
        for (var i = 0; i < this.selections.length; i++) {
            var origin = this.oTransform[i];
            var target = this.selections[i].transform.copy();
            if (origin.equals(target))
                continue;
            action.add(new TransformAction(this.selections[i], origin, target));
        }
        getCurrentContext().addAction(action);
    }
    select(objects, doAction) {
        if (objects.length === 0)
            return;
            
        var action = new GroupAction();
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            if (obj.selected)
                continue;
            obj.selected = true;
            this.selections.push(obj);
            this.sendToFront(obj);
            if (doAction)
                action.add(new SelectAction(obj));
        }
        if (doAction)
            getCurrentContext().addAction(action);
        popup.update();
        this.recalculateMidpoint();
    }
    deselectAll(doAction) {
        var objects = [];
        for (var i = 0; i < this.selections.length; i++)
            objects.push(this.selections[i]);
        this.deselect(objects, doAction);
    }
    deselect(objects, doAction) {
        if (objects.length === 0)
            return;
        
        var action = new GroupAction();
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            if (!obj.selected) {
                console.error("Can't deselect an unselected object! " + obj);
                continue;
            }
            obj.selected = false;
            this.selections.splice(this.selections.indexOf(obj), 1);
            if (doAction)
                action.add(new SelectAction(obj, true));
        }
        if (doAction)
            getCurrentContext().addAction(action);
        popup.update();
        this.recalculateMidpoint();
    }
    removeSelections() {
        if (this.selections.length === 0)
            return;
        var action = new GroupAction();
        var things = getAllThingsBetween(this.selections);
        for (var i = 0; i < things.length; i++) {
            if (things[i] instanceof Wire || things[i] instanceof WirePort) {
                var oldinput = things[i].input;
                var oldconnection = things[i].connection;
                things[i].remove();
                action.add(new DeleteAction(things[i], oldinput, oldconnection));
            }
        }
        for (var i = 0; i < things.length; i++) {
            if (!(things[i] instanceof Wire || things[i] instanceof WirePort)) {
                things[i].remove();
                action.add(new DeleteAction(things[i]));
            }
        }
        this.deselectAll();
        getCurrentContext().addAction(action);
        render();
    }
    selectAll() {
        this.deselectAll(true);
        this.select(getCurrentContext().getObjects(), true);
    }
    createBus() {
        var iports = [], oports = [];
        for (var i = 0; i < this.selections.length; i++) {
            if (this.selections[i] instanceof IPort)
                iports.push(this.selections[i]);
            else
                oports.push(this.selections[i]);
        }

        while (oports.length > 0) {
            var maxDist = -Infinity, maxDistIndex = -1, maxMinDistIndex = -1;
            for (var i = 0; i < oports.length; i++) {
                var oport = oports[i];
                var opos = oport.getPos();
                var minDist = Infinity, minDistIndex = -1;
                for (var j = 0; j < iports.length; j++) {
                    var iport = iports[j];
                    var dist = opos.sub(iport.getPos()).len2();
                    if (dist < minDist) {
                        minDist = dist;
                        minDistIndex = j;
                    }
                }
                if (minDist > maxDist) {
                    maxDist = minDist;
                    maxDistIndex = i;
                    maxMinDistIndex = minDistIndex;
                }
            }
            var wire = new Wire(context);
            getCurrentContext().add(wire);
            oports[maxDistIndex].connect(wire);
            wire.connect(iports[maxMinDistIndex]);
            wire.set = true;
            wire.straight = true;
            oports.splice(maxDistIndex, 1);
            iports.splice(maxMinDistIndex, 1);
        }
        render();
    }
    sendToFront(obj) {
        if (obj instanceof IOObject || obj instanceof Wire) {
            getCurrentContext().remove(obj);
            getCurrentContext().add(obj);
        }
    }
    recalculateMidpoint() {
        this.midpoint = V(0, 0);
        for (var i = 0; i < this.selections.length; i++)
            this.midpoint.translate(this.selections[i].getPos());
        this.midpoint = this.midpoint.scale(1. / this.selections.length);
    }
    draw(renderer) {
        var camera = renderer.getCamera();
        if (this.selections.length > 0 && !this.drag) {
            var pos = camera.getScreenPos(this.midpoint);
            var r = ROTATION_CIRCLE_RADIUS / camera.zoom;
            var br = ROTATION_CIRCLE_THICKNESS / camera.zoom;
            TransformController.draw(renderer);
            renderer.circle(pos.x, pos.y, r, undefined, '#ff0000', br, 0.5);
        }
        SelectionBox.draw(renderer);
    }
}
var selectionTool = new SelectionTool();