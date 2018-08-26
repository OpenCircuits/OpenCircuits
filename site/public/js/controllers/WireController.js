var WireController = (function() {
    var pressedPort = undefined;
    
    var pressedWire = undefined;
    var wireSplitPoint = -1;

    return {
        disabled: false,
        onMouseDown: function(somethingHappened) {
            var objects = getCurrentContext().getObjects();
            var wires = getCurrentContext().getWires();
            var worldMousePos = Input.getWorldMousePos();
                        
            // Make sure nothing else has happened
            if (somethingHappened)
                return;
            
            // Check if a IOPort was clicked to start creating new wire
            for (var i = objects.length-1; i >= 0; i--) {
                var obj = objects[i];

                // Check if port was clicked, then activate wire tool
                var ii;
                if ((ii = obj.oPortContains(worldMousePos)) !== -1) {
                    pressedPort = obj.outputs[ii];
                    return;
                }
                if ((ii = obj.iPortContains(worldMousePos)) !== -1) {
                    pressedPort = obj.inputs[ii];
                    return;
                }
            }
            
            // Check if a wire was pressed
            for (var i = 0; i < wires.length; i++) {
                var wire = wires[i];
                var t;
                if ((t = wire.getNearestT(worldMousePos.x, worldMousePos.y)) !== -1) {
                    pressedWire = wire;
                    wireSplitPoint = t;
                    return true;
                }
            }
        },
        onMouseMove: function(somethingHappened) {
            var worldMousePos = Input.getWorldMousePos();
            
            // Make sure nothing else has happened
            if (somethingHappened)
                return;
                
            // Begin dragging new wire
            if (pressedPort != undefined) {
                wiringTool.activate(pressedPort, getCurrentContext());
                pressedPort = undefined;
                return true;
            }
            
            // Begin splitting wire
            if (pressedWire != undefined) {
                pressedWire.split(wireSplitPoint);
                var action = new SplitWireAction(pressedWire);
                getCurrentContext().addAction(action);
                selectionTool.deselectAll(true);
                selectionTool.select([pressedWire.connection], true);
                TransformController.startDrag(pressedWire.connection, worldMousePos);
                pressedWire = undefined;
                return true;
            }
        },
        onMouseUp: function() {   
        },
        onClick: function(somethingHappened) {
            // Make sure nothing else has happened
            if (somethingHappened) {
                pressedPort = undefined;
                pressedWire = undefined;
                return;
            }

            // Clicking also begins dragging
            if (pressedPort != undefined) {
                wiringTool.activate(pressedPort, getCurrentContext());
                pressedPort = undefined;
                return true;
            }

            // Select wire
            if (pressedWire != undefined) {
                if (!Input.getShiftKeyDown())
                    selectionTool.deselectAll(true);
                selectionTool.select([pressedWire], true);
                pressedWire = undefined;
                return true;
            }
        }
    };
})();
