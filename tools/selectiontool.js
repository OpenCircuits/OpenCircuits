class SelectionTool extends Tool {
    constructor() {
        super();
        this.selections = [];
        this.midpoint = V(0, 0);
        this.drag = false;
        this.rotate = false;
        this.selectionBox = new SelectionBox();
        this.wireTool = new WireTool();
    }
    onKeyDown(code, input) {
        console.log(code);
        // if (!icdesigner.hidden)
        //     return;

        if (code === OPTION_KEY) {
            panTool.activate();
            return;
        }
        if (code === DELETE_KEY && !popup.focused) {
            this.removeSelections();
            return;
        }
        if (code === ENTER_KEY && popup.focused) {
            popup.onEnter();
            return;
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
            var o = this.midpoint;
            var p = worldMousePos;
            var d = p.sub(o).len2();
            if (d <= 79*79 && d >= 71*71) {
                this.rotate = true;
                this.startAngle = Math.atan2(p.y-o.y, p.x-o.x);
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
        }

        this.selectionBox.selBoxDownPos = undefined;
        var pressed = false;

        // Go through objects backwards since objects on top are in the back
        for (var i = objects.length-1; i >= 0; i--) {
            var obj = objects[i];

            // Check if object's selection box was pressed
            if (!this.drag && obj.sContains(worldMousePos)) {
                this.oTransform = [];
                for (var j = 0; j < this.selections.length; j++) {
                    this.oTransform[j] = this.selections[j].transform.copy();
                    if (this.selections[j] === obj) {
                        this.drag = true;
                        this.dragObj = this.selections[j];
                        this.dragPos = worldMousePos.copy().sub(this.dragObj.getPos());
                        popup.hide();
                        return true;
                    }
                }
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

        wireTool.activate(input);
        if (this.isActive)
            return this.selectionBox.onMouseDown(input);
    }
    onMouseMove(input) {
        var objects = input.parent.getObjects();
        var wires = input.parent.getWires();
        var worldMousePos = input.worldMousePos;

        if (!icdesigner.hidden)
            return false;

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

        if (this.selectionBox.onMouseUp(input))
            return true;

        // Stop dragging
        if (this.drag) {
            this.addTransformAction();
            this.drag = false;
            this.dragObj = undefined;
        }

        // Stop rotating
        if (this.rotate) {
            this.addTransformAction();
            this.rotate = false;
            return true;
        }

        if (this.selections.length > 0 && popup.hidden) {
            popup.show();
            popup.onMove();
        }

        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];

            // Release pressed object
            if (obj.isPressable && obj.curPressed) {
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
                this.deselect();
                this.select([obj]);
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
        while(this.selections.length > 0) {
            this.selections.splice(0, 1)[0].remove();
        }
        popup.deselect();
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
    recalculateMidpoint() {
        this.midpoint = V(0, 0);
        for (var i = 0; i < this.selections.length; i++)
            this.midpoint.translate(this.selections[i].getPos());
        this.midpoint = this.midpoint.scale(1. / this.selections.length);
    }
    draw(renderer) {
        var camera = renderer.getCamera();
        if (this.selections.length > 0) {
            var pos = camera.getScreenPos(this.midpoint);
            var r = 75 / camera.zoom, br = 4 / camera.zoom;
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
