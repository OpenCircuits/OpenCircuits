class SelectionTool extends Tool {
    constructor() {
        super();
        this.selections = [];
        this.midpoint = V(0, 0);
    }
    onKeyDown(code, input) {
        console.log(code);
        if (!icdesigner.hidden)
            return false;

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
    onMouseMove() {}
    onMouseUp() {
        var objects = getCurrentContext().getObjects();
        var wires = getCurrentContext().getWires();
        var worldMousePos = Input.getWorldMousePos();

        if (!icdesigner.hidden)
            return false;

        popup.update();

        var found = false;

        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];

            // Release pressed object
            if (obj.isPressable && obj.isOn && !Input.isDragging) {
                obj.release();
                found = true;
            }
        }
        return found;
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
                if (obj.selected)
                    return false;

                if (!Input.getShiftKeyDown() && this.selections.length > 0) {
                    this.deselectAll(true);

                    // Combine deselect and select actions
                    var deselectAction = getCurrentContext().designer.history.undoStack.pop();
                    this.select([obj], true);
                    var selectAction = getCurrentContext().designer.history.undoStack.pop();
                    var combined = new GroupAction();
                    if (deselectAction != undefined)
                        combined.add(deselectAction);
                    combined.add(selectAction);
                    getCurrentContext().addAction(combined);
                } else {
                    this.select([obj], true);
                }

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
    selectAll() {
        this.deselectAll(true);
        this.select(getCurrentContext().getObjects(), true);
    }
    deselectAll(doAction) {
        // Copy selections array because just passing selections
        // causes it to get mutated mid-loop at causes weirdness
        var objects = [];
        for (var i = 0; i < this.selections.length; i++)
            objects.push(this.selections[i]);
        this.deselect(objects, doAction);
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
