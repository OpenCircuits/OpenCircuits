class SelectionTool extends Tool {
    constructor() {
        super();
        this.selections = [];
        this.midpoint = V(0, 0);
        this.drag = false;
        this.rotate = false;
        this.selectionBox = new SelectionBox();

        this.wire = undefined;
        this.wireSplitPoint = -1;
        this.shouldSplit = false;
    }
    onKeyDown(code, input) {
        console.log(code);
        // if (!icdesigner.hidden)
        //     return;

        if (code === DELETE_KEY && !popup.focused) {
            this.removeSelections();
            return;
        }
        if (code === ENTER_KEY && popup.focused) {
            popup.onEnter();
            return;
        }
        if (code === A_KEY && input.modiferKeyDown) {
            this.selectAll();
            return true;
        }
    }
    onMouseDown(input) {
        var objects = input.parent.getObjects();
        var wires = input.parent.getWires();
        var worldMousePos = input.worldMousePos;

        if (!icdesigner.hidden)
            return false;

        // Check if rotation circle was pressed
        if (!this.rotate && this.selections.length > 0) {
            var d = worldMousePos.sub(this.midpoint).len2();
            if (d <= ROTATION_CIRCLE_R2 && d >= ROTATION_CIRCLE_R1)
                return this.startRotation(worldMousePos);
        }

        this.selectionBox.selBoxDownPos = undefined;
        var pressed = false;

        // Go through objects backwards since objects on top are in the back
        for (var i = objects.length-1; i >= 0; i--) {
            var obj = objects[i];

            // Check if object's selection box was pressed
            if (!this.drag && obj.sContains(worldMousePos)) {
                return this.startDrag(obj, worldMousePos);
            }

            // Check if object was pressed
            if (obj.contains(worldMousePos)) {
                if (obj.isPressable)
                    obj.press();
                return true;
            }

            // Ignore if a port was pressed
            if (obj.oPortContains(worldMousePos) !== -1 ||
                    obj.iPortContains(worldMousePos) !== -1) {
                return true;
            }
        }

        return this.pressedWire(input) ||
                this.selectionBox.onMouseDown(input);
    }
    onMouseMove(input) {
        var objects = input.parent.getObjects();
        var wires = input.parent.getWires();
        var worldMousePos = input.worldMousePos;

        if (!icdesigner.hidden)
            return false;

        // Split wire
        if (this.shouldSplit) {
            this.shouldSplit = false;
            this.wire.split(this.wireSplitPoint);
            var action = new SplitWireAction(this.wire);
            getCurrentContext().addAction(action);
            this.deselect();
            this.select([this.wire.connection]);
            this.startDrag(this.wire.connection, worldMousePos);
            this.wire = undefined;
        }

        // Transform selection(s)
        if (this.selections.length > 0) {
            // Move selection(s)
            if (this.drag) {
                this.moveSelections(worldMousePos, input.shiftKeyDown);
                return true;
            }

            // Rotate selection(s)
            if (this.rotate) {
                this.rotateSelections(worldMousePos, input.shiftKeyDown);
                return true;
            }
        }

        return this.selectionBox.onMouseMove(input);
    }
    onMouseUp(input) {
        var objects = input.parent.getObjects();
        var wires = input.parent.getWires();
        var worldMousePos = input.worldMousePos;

        if (!icdesigner.hidden)
            return false;

        if (this.selectionBox.onMouseUp(input)) {
            for (var i = 0; i < this.selections.length; i++)
                this.sendToFront(this.selections[i]);
            return true;
        }

        if (this.selections.length > 0 && popup.hidden) {
            popup.show();
            popup.onMove();
        }

        // Stop dragging
        if (this.drag) {
            this.addTransformAction();
            this.drag = false;
            this.dragObj = undefined;
            return true;
        }

        // Stop rotating
        if (this.rotate) {
            this.addTransformAction();
            this.rotate = false;
            return true;
        }

        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];

            // Release pressed object
            if (obj.isPressable && obj.isOn) {
                obj.release();
                return true;
            }
        }
    }
    onClick(input) {
        var objects = input.parent.getObjects();
        var wires = input.parent.getWires();
        var worldMousePos = input.worldMousePos;

        if (!icdesigner.hidden)
            return false;

        // Go through objects backwards since objects on top are in the back
        for (var i = objects.length-1; i >= 0; i--) {
            var obj = objects[i];

            // Check if object's selection box was clicked
            if (obj.sContains(worldMousePos)) {
                if (!input.shiftKeyDown)
                    this.deselect();
                this.select([obj]);

                this.sendToFront(obj);
                return true;
            }

            // Check if object was clicked
            if (obj.contains(worldMousePos)) {
                obj.click();
                return true;
            }

            // Check if port was clicked, then activate wire tool
            var ii;
            if ((ii = obj.oPortContains(worldMousePos)) !== -1) {
                wiringTool.activate(obj.outputs[ii], getCurrentContext());
                return true;
            }
            if ((ii = obj.iPortContains(worldMousePos)) !== -1) {
                wiringTool.activate(obj.inputs[ii], getCurrentContext());
                return true;
            }
        }

        // Select wire
        if (this.wire != undefined) {
            this.shouldSplit = false;
            if (!input.shiftKeyDown)
                this.deselect();
            this.select([this.wire]);
            this.wire = undefined;
            return true;
        }

        // Didn't click on anything so deselect everything
        if (this.selections.length > 0) {
            this.deselect();
            return true;
        }
    }
    addTransformAction() {
        var action = new GroupAction();
        for (var i = 0; i < this.selections.length; i++) {
            var origin = this.oTransform[i];
            var target = this.selections[i].transform.copy();
            action.add(new TransformAction(this.selections[i], origin, target));
        }
        getCurrentContext().addAction(action);
    }
    select(objects) {
        if (objects.length === 0)
            return;

        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            obj.selected = true;
            this.selections.push(obj);
        }
        popup.select(objects);
        this.recalculateMidpoint();
    }
    deselect() {
        for (var i = 0; i < this.selections.length; i++)
            this.selections[i].selected = false;
        this.selections = [];
        popup.deselect();
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
        this.deselect();
        getCurrentContext().addAction(action);
        render();
    }
    moveSelections(pos, shift) {
        var dPos = V(pos.x, pos.y).sub(this.dragObj.getPos()).sub(this.dragPos);
        for (var i = 0; i < this.selections.length; i++) {
            var selection = this.selections[i];
            var newPos = selection.getPos().add(dPos);
            if (shift) {
                newPos = V(Math.floor(newPos.x/GRID_SIZE+0.5)*GRID_SIZE,
                           Math.floor(newPos.y/GRID_SIZE+0.5)*GRID_SIZE);
            }
            selection.setPos(newPos);
        }
        this.recalculateMidpoint();
        popup.updatePosValue();
    }
    rotateSelections(pos, shift) {
        var origin = this.midpoint;
        var dAngle = Math.atan2(pos.y - origin.y, pos.x - origin.x) - this.prevAngle;
        for (var i = 0; i < this.selections.length; i++) {
            var newAngle = this.realAngles[i] + dAngle;
            this.realAngles[i] = newAngle;
            if (shift)
                newAngle = Math.floor(newAngle/(Math.PI/4))*Math.PI/4;
            this.selections[i].setRotationAbout(newAngle, origin);
        }
        this.prevAngle = dAngle + this.prevAngle;
    }
    startDrag(obj, worldMousePos) {
        this.oTransform = [];
        for (var j = 0; j < this.selections.length; j++)
            this.oTransform[j] = this.selections[j].transform.copy();
        this.drag = true;
        this.dragObj = obj;
        this.dragPos = worldMousePos.copy().sub(obj.getPos());
        popup.hide();
        return true;
    }
    startRotation(worldMousePos) {
        this.rotate = true;
        this.startAngle = Math.atan2(worldMousePos.y-this.midpoint.y, worldMousePos.x-this.midpoint.x);
        this.prevAngle = this.startAngle;
        this.realAngles = [];
        this.oTransform = [];
        for (var i = 0; i < this.selections.length; i++) {
            this.realAngles[i] = this.selections[i].getAngle();
            this.oTransform[i] = this.selections[i].transform.copy();
        }
        popup.hide();
        return false;
    }
    pressedWire(input) {
        var wires = input.parent.getWires();
        var worldMousePos = input.worldMousePos;

        // Check if a wire was pressed
        for (var i = 0; i < wires.length; i++) {
            var wire = wires[i];
            var t;
            if ((t = wire.getNearestT(worldMousePos.x, worldMousePos.y)) !== -1) {
                this.wire = wire;
                this.wireSplitPoint = t;
                this.shouldSplit = true;
                return true;
            }
        }
        return false;
    }
    selectAll() {
        this.deselect();
        this.select(getCurrentContext().getObjects());
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
            if (this.rotate) {
                renderer.save();
                renderer.context.fillStyle = '#fff';
                renderer.context.strokeStyle = '#000'
                renderer.context.lineWidth = 5;
                renderer.context.globalAlpha = 0.4;
                renderer.context.beginPath();
                renderer.context.moveTo(pos.x, pos.y);
                var da = (this.prevAngle - this.startAngle) % (2*Math.PI);
                if (da < 0) da += 2*Math.PI;
                renderer.context.arc(pos.x, pos.y, r, this.startAngle, this.prevAngle, da > Math.PI);
                renderer.context.fill();
                renderer.context.closePath();
                renderer.restore();
            }
            renderer.circle(pos.x, pos.y, r, undefined, '#ff0000', br, 0.5);
        }
        this.selectionBox.draw(renderer);
    }
}
