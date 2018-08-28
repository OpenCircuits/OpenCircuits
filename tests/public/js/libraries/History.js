describe("History", () => {
    var history = getCurrentContext().designer.history;
    describe("Transformation Actions", () => {
        it("Translation", () => {
            history.undoStack = [];
            history.redoStack = [];
            selectionTool.deselectAll();
            
            var s = new Switch();
            selectionTool.select([s]);
            TransformController.startDrag(s, V(0, 0));
            Input.getWorldMousePos = function() {
                return V(5, 1);
            }
            TransformController.onMouseMove();
            TransformController.onMouseUp();
            
            assert(history.undoStack.length === 1, "Action not added to undoStack!");
            assert(history.redoStack.length === 0, "Action shouldn't be on redoStack!");
            assert.equal(s.transform.pos.x, 5, "Object not moved properly!");
            assert.equal(s.transform.pos.y, 1, "Object not moved properly!");
            
            history.undo();
            
            assert(history.undoStack.length === 0, "Action not removed from undoStack!");
            assert(history.redoStack.length === 1, "Action not added to redoStack!");
            assert.equal(s.transform.pos.x, 0, "Object not moved properly!");
            assert.equal(s.transform.pos.y, 0, "Object not moved properly!");
            
            history.redo();
            
            assert(history.undoStack.length === 1, "Action not added to undoStack!");
            assert(history.redoStack.length === 0, "Action not removed from redoStack!");
            assert.equal(s.transform.pos.x, 5, "Object not moved properly!");
            assert.equal(s.transform.pos.y, 1, "Object not moved properly!");
        });
        it("Rotation", () => {
            history.undoStack = [];
            history.redoStack = [];
            selectionTool.deselectAll();
            
            var s = new Switch();
            selectionTool.select([s]);
            TransformController.startRotation([s], V(1, 0));
            Input.getWorldMousePos = function() {
                return V(0, 1);
            }
            TransformController.onMouseMove();
            TransformController.onMouseUp();
            
            assert(history.undoStack.length === 1, "Action not added to undoStack!");
            assert(history.redoStack.length === 0, "Action shouldn't be on redoStack!");
            assert(Math.abs(s.transform.angle - Math.PI/2) < 1e-8, "Object not rotated properly!");
            
            history.undo();
            
            assert(history.undoStack.length === 0, "Action not removed from undoStack!");
            assert(history.redoStack.length === 1, "Action not added to redoStack!");
            assert(Math.abs(s.transform.angle - 0) < 1e-8, "Object not rotated properly!");

            history.redo();
            
            assert(history.undoStack.length === 1, "Action not added to undoStack!");
            assert(history.redoStack.length === 0, "Action not removed from redoStack!");
            assert(Math.abs(s.transform.angle - Math.PI/2) < 1e-8, "Object not rotated properly!");
        });
        it("Selection", () => {
            history.undoStack = [];
            history.redoStack = [];
            selectionTool.deselectAll();
            
            var s1 = new Switch();
            selectionTool.select([s1], true);
            
            assert(history.undoStack.length === 1, "Action not added to undoStack!");
            assert(history.redoStack.length === 0, "Action shouldn't be on redoStack!");
            assert(s1.selected, "Object not selected!");
            assert(selectionTool.selections[0] === s1, "Object not in selections!");
            assert(selectionTool.selections.length === 1, "Too many selections!");
            
            history.undo();
            
            assert(history.undoStack.length === 0, "Action not removed from undoStack!");
            assert(history.redoStack.length === 1, "Action not added to redoStack!");
            assert(!s1.selected, "Object selected!");
            assert(selectionTool.selections.length === 0, "Object not removed from selections!");

            history.redo();
            
            assert(history.undoStack.length === 1, "Action not added to undoStack!");
            assert(history.redoStack.length === 0, "Action not removed from redoStack!");
            assert(s1.selected, "Object not selected!");
            assert(selectionTool.selections[0] === s1, "Object not in selections!");
            assert(selectionTool.selections.length === 1, "Too many selections!");
        });
        it("Multi-Selection", () => {
            history.undoStack = [];
            history.redoStack = [];
            selectionTool.deselectAll();
            
            var s1 = new ConstantLow(getCurrentContext(), 0, 0);
            var s2 = new ConstantLow(getCurrentContext(), 1000, 0);
            var s3 = new ConstantLow(getCurrentContext(), 0, 1000);
            
            getCurrentContext().addObject(s1);
            getCurrentContext().addObject(s2);
            getCurrentContext().addObject(s3);
            
            // Select s1
            selectionTool.select([s1], true);
            assert(history.undoStack.length === 1, "Action not added to undoStack!");
            assert(history.redoStack.length === 0, "Action shouldn't be on redoStack!");
            assert(s1.selected, "Object 1 not selected!");
            assert(!s2.selected, "Object 2 selected!");
            assert(!s3.selected, "Object 3 selected!");
            
            // Select s2
            Input.getWorldMousePos = function() {
                return V(1000, 0);
            }
            selectionTool.onClick();
            assert(history.undoStack.length === 2, "Action not added to undoStack!");
            assert(history.redoStack.length === 0, "Action shouldn't be on redoStack!");
            assert(!s1.selected, "Object 1 selected!");
            assert(s2.selected, "Object 2 not selected!");
            assert(!s3.selected, "Object 3 selected!");
            
            // Select s3
            Input.getWorldMousePos = function() {
                return V(0, 1000);
            }
            selectionTool.onClick();
            assert(history.undoStack.length === 3, "Action not added to undoStack!");
            assert(history.redoStack.length === 0, "Action shouldn't be on redoStack!");
            assert(!s1.selected, "Object 1 selected!");
            assert(!s2.selected, "Object 2 selected!");
            assert(s3.selected, "Object 3 not selected!");
            
            // Undo 1
            history.undo();
            assert(history.undoStack.length === 2, "Action not added to undoStack!");
            assert(history.redoStack.length === 1, "Action shouldn't be on redoStack!");
            assert(!s1.selected, "Object 1 selected!");
            assert(s2.selected, "Object 2 not selected!");
            assert(!s3.selected, "Object 3 selected!");
            
            // Undo 2 
            history.undo();
            assert(history.undoStack.length === 1, "Action not added to undoStack!");
            assert(history.redoStack.length === 2, "Action shouldn't be on redoStack!");
            assert(s1.selected, "Object 1 not selected!");
            assert(!s2.selected, "Object 2 selected!");
            assert(!s3.selected, "Object 3 selected!");
            
            // Undo 3
            history.undo();
            assert(history.undoStack.length === 0, "Action not added to undoStack!");
            assert(history.redoStack.length === 3, "Action shouldn't be on redoStack!");
            assert(!s1.selected, "Object 1 selected!");
            assert(!s2.selected, "Object 2 selected!");
            assert(!s3.selected, "Object 3 selected!");
            
            // Redo 1
            history.redo();
            assert(history.undoStack.length === 1, "Action not added to undoStack!");
            assert(history.redoStack.length === 2, "Action shouldn't be on redoStack!");
            assert(s1.selected, "Object 1 not selected!");
            assert(!s2.selected, "Object 2 selected!");
            assert(!s3.selected, "Object 3 selected!");
            
            // Redo 2
            history.redo();
            assert(history.undoStack.length === 2, "Action not added to undoStack!");
            assert(history.redoStack.length === 1, "Action shouldn't be on redoStack!");
            assert(!s1.selected, "Object 1 not selected!");
            assert(s2.selected, "Object 2 not selected!");
            assert(!s3.selected, "Object 3 selected!");
            
            // Redo 3
            history.redo();
            assert(history.undoStack.length === 3, "Action not added to undoStack!");
            assert(history.redoStack.length === 0, "Action shouldn't be on redoStack!");
            assert(!s1.selected, "Object 1 not selected!");
            assert(!s2.selected, "Object 2 selected!");
            assert(s3.selected, "Object 3 not selected!");
        });
    });
});