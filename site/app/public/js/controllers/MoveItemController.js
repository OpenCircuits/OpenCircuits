var MoveItemController = (function() {
    var pressedObj = undefined;
    var isDragging = false;
    var dragPos = V(0,0);
    var dragObjects = [];
    var startTransforms = []; // For undoing
    
    var drag = function(pos, shift) {
        var dPos = V(pos).sub(pressedObj.getPos()).sub(dragPos);
        for (var i = 0; i < dragObjects.length; i++) {
            var obj = dragObjects[i];
            var newPos = obj.getPos().add(dPos);
            if (shift) {
                newPos = V(Math.floor(newPos.x/GRID_SIZE+0.5)*GRID_SIZE,
                           Math.floor(newPos.y/GRID_SIZE+0.5)*GRID_SIZE);
            }
            obj.setPos(newPos);
        }
        selectionTool.recalculateMidpoint();
    }

    return {
        startDrag: function(obj, worldMousePos) {
            if (!obj.selected) {
                selectionTool.deselectAll();
                selectionTool.select([obj]);
            }
            dragObjects = selectionTool.selections;
            
            startTransforms = [];
            for (var j = 0; j < dragObjects.length; j++)
                startTransforms[j] = dragObjects[j].transform.copy();
            isDragging = true;
            dragPos = worldMousePos.copy().sub(obj.getPos());
            pressedObj = obj;
            popup.hide();
            return true;
        },
        onMouseDown: function() {
            var objects = getCurrentContext().getObjects();
            var worldMousePos = Input.getWorldMousePos();
            
            // Go through objects backwards since objects on top are in the back
            for (var i = objects.length-1; i >= 0; i--) {
                var obj = objects[i];

                // Check if object's selection box was pressed
                if (obj.contains(worldMousePos) || obj.sContains(worldMousePos)) {
                    pressedObj = obj;
                    return;
                }
            }
        },
        onMouseMove: function() {
            var objects = getCurrentContext().getObjects();
            var worldMousePos = Input.getWorldMousePos();
            
            // Begin dragging
            if (!isDragging && pressedObj != undefined) {
                return this.startDrag(pressedObj, worldMousePos);
            }
            
            // Actually move the object(s)
            if (isDragging) {
                drag(worldMousePos, Input.getShiftKeyDown());
                return true;
            }
        },
        onMouseUp: function() {
            pressedObj = undefined;

            // Stop dragging
            if (isDragging) {
                // Add transform action
                getCurrentContext().addAction(createTransformAction(dragObjects, startTransforms))
                isDragging = false;
                return true;
            }
        },
        onClick: function() {
        }
    };
})();
