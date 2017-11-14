class HistoryManager {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
    }
    onKeyDown(code, input) {
        if (input.modiferKeyDown) {
            if (code === Y_KEY || (code === Z_KEY && input.shiftKeyDown))
                this.redo();
            else if (code === Z_KEY)
                this.undo();
        }
    }
    add(action) {
        // Check for empty group action
        if (action instanceof GroupAction &&
            action.actions.length == 0) {
                return;
        }

        // Check for selection and deselection action
        // Added one after another to combine
        if (action instanceof GroupAction &&
            action.actions[0] instanceof SelectAction) {
                var prev = this.undoStack[this.undoStack.length-1];
                if (this.undoStack.length > 0 &&
                    !action.actions[0].flip &&
                    prev instanceof GroupAction &&
                    prev.actions[0] instanceof SelectAction &&
                    prev.actions[0].flip) {
                        var newAction = new GroupAction();
                        newAction.add(action);
                        newAction.add(prev);
                        this.redoStack = [];
                        this.undoStack[this.undoStack.length-1] = newAction;
                        return;
                    }
        }
        this.redoStack = [];
        this.undoStack.push(action);
    }
    undo() {
        if (this.undoStack.length > 0) {
            var action = this.undoStack.pop();
            action.undo();
            this.redoStack.push(action);
            // Update popup's values
            popup.update();
            render();
        }
    }
    redo() {
        if (this.redoStack.length > 0) {
            var action = this.redoStack.pop();
            action.redo();
            this.undoStack.push(action);
            // Update popup's values
            popup.update();
            render();
        }
    }
}
