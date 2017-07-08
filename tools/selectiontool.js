var asd = 0;
class SelectionTool extends Tool {
    constructor() {
        super();
        this.isWirePressed = false;
        this.pressedWire = undefined;
        this.selections = [];
        this.clipboard = [];
        this.midpoint = V(0, 0);
        this.drag = false;
        this.rotate = false;
        this.startAngle = 0;
        this.prevAngle = 0;
        this.shift = false;
        this.modiferKeyDown = false;
        this.selBoxDownPos = undefined;
        this.selBoxCurPos = undefined;
    }
    onKeyDown(code, input) {
        console.log(code);
        // if (!icdesigner.hidden)
        //     return;

        switch (code) {
            case 18: // Option Key
                panTool.activate();
                break;
            case 16: // Shift Key
                this.shift = true;
                break;
            case 8: // Delete Key
                if (!popup.focused)
                    this.removeSelections();
                break;
            case 13: // Enter Key
                if (popup.focused)
                    popup.onEnter();
                break;
            case 67: // C Key
                if (this.modiferKeyDown && this.selections.length > 0)
                    this.copy();
                break;
            case 88: // X key
                if (this.modiferKeyDown && this.selections.length > 0)
                    this.cut();
                break;
            case 86: // V key
                if (this.modiferKeyDown && this.clipboard.length > 0)
                    this.paste(input);
                break;
            case 17: // Control
            case 91: // Command
                this.modiferKeyDown = true;
                break;
            default:
                break;
        }
    }
    onKeyUp(code) {
        this.shift = false;
        this.modiferKeyDown = false;
    }
    onMouseMove(input) {
        var objects = input.parent.getObjects();
        var wires = input.parent.getWires();
        var worldMousePos = input.worldMousePos;

        if (!icdesigner.hidden)
            return;

        if (this.isWirePressed) {
            this.pressedWire.move(worldMousePos.x, worldMousePos.y);
            render();
        } else {

            // Transform selection(s)
            if (this.selections.length > 0) {

                // Move selection(s)
                if (this.drag) {
                    var dv = V(worldMousePos.x, worldMousePos.y).sub(this.dragObj.getPos()).sub(this.dragPos);
                    for (var i = 0; i < this.selections.length; i++) {
                        var v = this.selections[i].getPos().add(dv);
                        if (this.shift) {
                            v.x = Math.floor(v.x/50+0.5)*50;
                            v.y = Math.floor(v.y/50+0.5)*50;
                        }
                        this.selections[i].setPos(v);
                    }
                    this.recalculateMidpoint();
                    popup.updatePosValue();
                    render();
                }

                // Rotate selection(s)
                else if (this.rotate) {
                    var o = this.midpoint;
                    var p = worldMousePos;
                    var angle = Math.atan2(p.y-o.y, p.x-o.x);
                    for (var i = 0; i < this.selections.length; i++) {
                        var fAngle = this.realAngles[i] + angle - this.prevAngle;
                        this.realAngles[i] = fAngle;
                        if (this.shift) {
                            fAngle = Math.floor(fAngle/(Math.PI/4))*Math.PI/4;
                        }
                        this.selections[i].setRotationAbout(fAngle, o);
                    }
                    this.prevAngle = angle;
                    render();
                }
            }

            // Selection box
            // TODO: Only calculate ON MOUSE UP!
            if (this.selBoxDownPos !== undefined) {
                this.selBoxCurPos = V(worldMousePos.x, worldMousePos.y);
                var p1 = this.selBoxDownPos;
                var p2 = this.selBoxCurPos;
                var trans = new Transform(V((p1.x+p2.x)/2, (p1.y+p2.y)/2), V(Math.abs(p2.x-p1.x), Math.abs(p2.y-p1.y)), 0, input.camera);
                var selections = [];
                for (var i = 0; i < objects.length; i++) {
                    var obj = objects[i];
                    var t = (obj.selectionBoxTransform !== undefined ? obj.selectionBoxTransform : obj.transform);
                    if (transformContains(t, trans))
                        selections.push(obj);
                }
                this.deselect();
                this.select(selections);
                render();
            }

        }
    }
    onMouseDown(input) {
        var objects = input.parent.getObjects();
        var wires = input.parent.getWires();
        var worldMousePos = input.worldMousePos;

        if (!icdesigner.hidden)
            return;

        // Check if rotation circle was pressed
        if (this.selections.length > 0) {
            var o = this.midpoint;
            var p = worldMousePos;
            var d = p.sub(o).len2();
            if (d <= 79*79 && d >= 71*71) {
                this.rotate = true;
                this.startAngle = Math.atan2(p.y-o.y, p.x-o.x);
                this.prevAngle = this.startAngle;
                this.realAngles = [];
                for (var i = 0; i < this.selections.length; i++)
                    this.realAngles[i] = this.selections[i].getAngle();
                popup.hide();
                return;
            }
        }

        this.selBoxDownPos = undefined;
        var pressed = false;

        // Go through objects backwards since objects on top are in the back
        for (var i = objects.length-1; i >= 0 && !pressed; i--) {
            var obj = objects[i];

            // Check if object's selection box was pressed
            if (obj.sContains(worldMousePos)) {
                for (var j = 0; j < this.selections.length; j++) {
                    if (this.selections[j] === obj) {
                        this.drag = true;
                        this.dragObj = this.selections[j];
                        this.dragPos = worldMousePos.copy().sub(this.dragObj.getPos());
                        popup.hide();
                        pressed = true;
                        break;
                    }
                }
            }

            // Check if object was pressed
            if (obj.contains(worldMousePos)) {
                if (obj.isPressable)
                    obj.press();
                pressed = true;
            }

            // Ignore if a port was pressed
            if (obj.oPortContains(worldMousePos) !== -1 ||
                    obj.iPortContains(worldMousePos) !== -1) {
                pressed = true;
            }
        }

        // If something was pressed, then render scene
        if (pressed) {
            render();
        } else {

            // Check if a wire was pressed
            if (!this.isWirePressed) {
                for (var i = 0; i < wires.length; i++) {
                    var wire = wires[i];
                    var t;
                    if ((t = wire.getNearestT(worldMousePos.x, worldMousePos.y)) !== -1) {
                        this.isWirePressed = true;
                        this.pressedWire = wires[i];
                        console.log("press-arooney " + t);
                        wire.press(t);
                        render();
                        return;
                    }
                }
            }

            this.selBoxDownPos = V(worldMousePos.x, worldMousePos.y);
        }
    }
    onMouseUp(input) {
        var objects = input.parent.getObjects();
        var wires = input.parent.getWires();
        var worldMousePos = input.worldMousePos;

        if (!icdesigner.hidden)
            return;

        // Stop selection box
        this.selBoxDownPos = undefined;
        if (this.selBoxCurPos !== undefined) {
            this.selBoxCurPos = undefined;
            popup.deselect();
            if (this.selections.length > 0)
                popup.select(this.selections);
            render();
        }

        // Stop moving wire
        if (this.isWirePressed) {
            this.isWirePressed = false;
            this.pressedWire = undefined;
        }

        // Stop dragging
        if (this.drag) {
            this.drag = false;
            this.dragObj = undefined;
        }

        // Stop rotating
        if (this.rotate) {
            this.rotate = false;
            render();
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
                render();
                break;
            }
        }
    }
    onClick(input) {
        var objects = input.parent.getObjects();
        var wires = input.parent.getWires();
        var worldMousePos = input.worldMousePos;

        if (!icdesigner.hidden)
            return;

        var clicked = false;

        // Go through objects backwards since objects on top are in the back
        for (var i = objects.length-1; i >= 0 && !clicked; i--) {
            var obj = objects[i];

            // Check if object's selection box was clicked
            if (obj.sContains(worldMousePos)) {
                this.deselect();
                this.select([obj]);
                clicked = true;
            }

            // Check if object was clicked
            if (obj.contains(worldMousePos)) {
                if (obj.isPressable)
                    obj.click();
                clicked = true;
            }

            // Check if port was clicked, then activate wire tool
            var ii;
            if ((ii = obj.oPortContains(worldMousePos)) !== -1) {
                wiringTool.activate(obj.outputs[ii], getCurrentContext());
                clicked = true;
            }
        }

        if (clicked) {
            render();
        } else if (this.selections.length > 0) {
            this.deselect();
            render();
        }
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
    recalculateMidpoint() {
        this.midpoint = V(0, 0);
        for (var i = 0; i < this.selections.length; i++)
            this.midpoint.translate(this.selections[i].getPos());
        this.midpoint = this.midpoint.scale(1. / this.selections.length);
    }
    copy() {
        this.clipboard = copyGroup(this.selections);
    }
    cut() {
        this.copy();
        this.removeSelections();
    }
    paste(input) {
        var copies = copyGroup(this.clipboard[0]);
        for (var i = 0; i < copies[0].length; i++) {
            input.parent.addObject(copies[0][i]);
            copies[0][i].setPos(copies[0][i].getPos().add(V(5,5)));
        }
        for (var i = 0; i < copies[1].length; i++)
            input.parent.addWire(copies[1][i]);
        this.deselect();
        this.select(copies[0]);
        render();
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
        if (this.selBoxDownPos !== undefined && this.selBoxCurPos !== undefined) {
            var pos1 = camera.getScreenPos(this.selBoxDownPos);
            var pos2 = camera.getScreenPos(this.selBoxCurPos);
            var w = pos2.x - pos1.x, h = pos2.y - pos1.y;
            renderer.save();
            renderer.context.globalAlpha = 0.4;
            renderer.rect(pos1.x+w/2, pos1.y+h/2, w, h, '#ffffff', '#6666ff', 2 / camera.zoom);
            renderer.restore();
        }
    }
}
