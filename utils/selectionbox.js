class SelectionBox {
    constructor() {
        this.selBoxDownPos = undefined;
        this.selBoxCurPos = undefined;
    }
    onMouseDown(input) {
        var worldMousePos = input.worldMousePos;
        if (!input.optionKeyDown) {
            this.selBoxDownPos = V(worldMousePos.x, worldMousePos.y);
            popup.hide();
        }
    }
    onMouseMove(input) {
        var objects = input.parent.getObjects();
        var worldMousePos = input.worldMousePos;

        // TODO: Only calculate ON MOUSE UP!
        if (this.selBoxDownPos != undefined) {
            this.selBoxCurPos = V(worldMousePos.x, worldMousePos.y);
            var p1 = this.selBoxDownPos;
            var p2 = this.selBoxCurPos;
            var trans = new Transform(V((p1.x+p2.x)/2, (p1.y+p2.y)/2), V(Math.abs(p2.x-p1.x), Math.abs(p2.y-p1.y)), 0, input.camera);
            var selections = [];
            for (var i = 0; i < objects.length; i++) {
                var obj = objects[i];
                var t = (obj.selectionBoxTransform != undefined ? obj.selectionBoxTransform : obj.transform);
                if (transformContains(t, trans)) {
                    selections.push(obj);
                } else if (obj.inputs != undefined && obj.outputs != undefined) {
                    // Check if an iport or oport is selected
                    for (var j = 0; j < obj.inputs.length; j++) {
                        var input = obj.inputs[j];
                        if (rectContains(trans, input.getPos()))
                            selections.push(input);
                    }
                    for (var j = 0; j < obj.outputs.length; j++) {
                        var output = obj.outputs[j];
                        if (rectContains(trans, output.getPos()))
                            selections.push(output);
                    }
                }
            }
            if (!input.shiftKeyDown)
                selectionTool.deselect();
            selectionTool.select(selections);
            popup.hide();
            return true;
        }
    }
    onMouseUp(input) {
        // Stop selection box
        this.selBoxDownPos = undefined;
        if (this.selBoxCurPos != undefined) {
            this.selBoxCurPos = undefined;
            if (!input.shiftKeyDown)
                popup.deselect();
            if (selectionTool.selections.length > 0)
                popup.select(selectionTool.selections);
            return true;
        }
    }
    draw(renderer) {
        var camera = renderer.getCamera();
        if (this.selBoxDownPos != undefined && this.selBoxCurPos != undefined) {
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
