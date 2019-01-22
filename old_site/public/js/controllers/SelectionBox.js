var SelectionBox = (function () {
    var pos1 = undefined; // First corner
    var pos2 = undefined; // Second corner
    
    var getSelections = function() {
        var objects = getCurrentContext().getObjects();
        var selections = [];
        if (pos1 != undefined) {
            var trans = new Transform(V((pos1.x+pos2.x)/2, (pos1.y+pos2.y)/2), 
                                      V(Math.abs(pos2.x-pos1.x), Math.abs(pos2.y-pos1.y)), 
                                      0, getCurrentContext().getCamera());
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
        }
        return selections;
    }
    
    return {
        disabled: false,
        onMouseDown: function(somethingHappened) {
            var objects = getCurrentContext().getObjects();
            var wires = getCurrentContext().getWires();
            var worldMousePos = Input.getWorldMousePos();
            
            // Make sure nothing but blank canvas was clicked
            if (somethingHappened || !selectionTool.isActive 
                || Input.getOptionKeyDown())
                return;
            for (var i = 0; i < objects.length; i++) {
                var obj = objects[i];
                if (obj.contains(worldMousePos) || obj.sContains(worldMousePos) ||
                    obj.oPortContains(worldMousePos) !== -1 || obj.iPortContains(worldMousePos) !== -1)
                    return;
            }
            for (var i = 0; i < wires.length; i++) {
                var wire = wires[i];
                if (wire.getNearestT(worldMousePos.x, worldMousePos.y) !== -1)
                    return;
            }
            
            pos1 = V(worldMousePos);
            popup.hide();
        },
        onMouseMove: function() {
            var objects = getCurrentContext().getObjects();
            var worldMousePos = Input.getWorldMousePos();

            if (pos1 != undefined) {
                pos2 = V(worldMousePos);
                popup.hide();
                return true;
            }
        },
        onMouseUp: function() {
        },
        onClick: function(somethingHappened) {
            var objects = getCurrentContext().getObjects();
            var worldMousePos = Input.getWorldMousePos();

            // Stop selection box
            if (pos1 != undefined) {
                pos2 = V(worldMousePos);
                var selections = getSelections();
                if (!Input.getShiftKeyDown())
                    selectionTool.deselectAll(true);
                selectionTool.select(selections, true);
                pos1 = undefined;
                pos2 = undefined;
                return true;
            }
        },
        draw(renderer) {
            var camera = renderer.getCamera();
            if (pos1 != undefined && pos2 != undefined) {
                var p1 = camera.getScreenPos(pos1);
                var p2 = camera.getScreenPos(pos2);
                var w = p2.x - p1.x, h = p2.y - p1.y;
                renderer.save();
                renderer.context.globalAlpha = 0.4;
                renderer.rect(p1.x+w/2, p1.y+h/2, w, h, '#ffffff', '#6666ff', 2 / camera.zoom);
                renderer.restore();
            }
        }
    }
})();
