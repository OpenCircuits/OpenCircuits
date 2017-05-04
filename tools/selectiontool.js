class SelectionTool extends Tool {
    constructor() {
        super();
        this.isWirePressed = false;
        this.pressedWire = undefined;
        this.selection = undefined;
        this.drag = false;
        this.rotate = false;
        this.startAngle = 0;
        this.prevAngle = 0;
        this.shift = false;
    }
    onKeyDown(code) {
        console.log(code);
        if (code === 18) { // Option key
            panTool.activate();
        } else if (code === 16) { // Shift key
            this.shift = true;
        }
    }
    onKeyUp(code) {
        this.shift = false;
    }
    onMouseMove() {
        if (this.isWirePressed) {
            this.pressedWire.move(worldMousePos.x, worldMousePos.y);
            render();
        } else {
            if (this.selection !== undefined) {
                if (this.drag) {
                    var v = V(worldMousePos.x, worldMousePos.y);
                    if (this.shift) {
                        v.x = Math.floor(v.x/50+0.5)*50;
                        v.y = Math.floor(v.y/50+0.5)*50;
                    }
                    this.selection.setPos(v);
                    popup.updatePosValue();
                    render();
                } else if (this.rotate) {
                    var o = this.selection.getPos();
                    var p = worldMousePos;
                    var angle = Math.atan2(p.y-o.y, p.x-o.x);
                    var fAngle = this.selection.getAngle() + angle - this.prevAngle;
                    if (this.shift) {
                        fAngle = Math.floor(fAngle/(Math.PI/4))*Math.PI/4;
                    }
                    this.selection.setAngle(fAngle);
                    this.prevAngle = fAngle;
                    render();
                }
            }
        }
    }
    onMouseDown() {
        var pressed = false;
        for (var i = 0; i < objects.length && !pressed; i++) {
            var obj = objects[i];

            // Check if object's selection box was pressed
            if (obj.sContains(worldMousePos)) {
                if (this.selection === obj) {
                    this.drag = true;
                    popup.hide();
                }
                pressed = true;
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
            // Check if rotation circle was pressed
            if (this.selection !== undefined) {
                var o = this.selection.getPos();
                var p = worldMousePos;
                var d = p.sub(o).len2();
                if (d <= 79*79 && d >= 71*71) {
                    this.rotate = true;
                    this.startAngle = Math.atan2(p.y-o.y, p.x-o.x);
                    this.prevAngle = this.startAngle;
                    popup.hide();
                    return;
                }
            }

            // Check if a wire was pressed
            if (!this.isWirePressed) {
                for (var i = 0; i < wires.length; i++) {
                    var wire = wires[i];

                    var t;
                    if ((t = wire.curve.getNearestT(worldMousePos.x, worldMousePos.y)) !== -1) {
                        this.isWirePressed = true;
                        this.pressedWire = wires[i];
                        console.log("press-arooney " + t);
                        wire.press(t);
                        render();
                        break;
                    }
                }
            }
        }
    }
    onMouseUp() {
        // Stop moving wire
        if (this.isWirePressed) {
            this.isWirePressed = false;
            this.pressedWire = undefined;
        }
        // Stop dragging
        if (this.drag) {
            this.drag = false;
            render();
        }
        // Stop rotating
        if (this.rotate) {
            this.rotate = false;
            render();
        }

        if (this.selection !== undefined && popup.hidden) {
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
    onClick() {
        var clicked = false;
        for (var i = 0; i < objects.length && !clicked; i++) {
            var obj = objects[i];

            // Check if object's selection box was clicked
            if (obj.sContains(worldMousePos)) {
                popup.select(obj);
                this.selection = obj;
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
                wiringTool.activate(obj.outputs[ii]);
                clicked = true;
            }
        }

        if (clicked) {
            render();
        } else if (this.selection !== undefined) {
            popup.deselect();
            this.selection = undefined;
            render();
        }
    }
    draw() {
        if (this.selection !== undefined) {
            var pos = camera.getScreenPos(this.selection.getPos());
            var r = 75 / camera.zoom, br = 4 / camera.zoom;
            if (this.rotate) {
                saveCtx();
                frame.context.fillStyle = '#fff';
                frame.context.strokeStyle = '#000'
                frame.context.lineWidth = 5;
                frame.context.globalAlpha = 0.4;
                frame.context.beginPath();
                frame.context.moveTo(pos.x, pos.y);
                console.log(this.prevAngle * 180 / Math.PI);
                console.log(this.startAngle * 180 / Math.PI);
                var da = (this.prevAngle - this.startAngle);
                console.log(da * 180 / Math.PI);
                frame.context.arc(pos.x, pos.y, r, this.startAngle, this.prevAngle, da < 0);
                frame.context.fill();
                frame.context.closePath();
                restoreCtx();
            }
            circle(pos.x, pos.y, r, null, '#ff0000', br, 0.5);
        }
    }
}
