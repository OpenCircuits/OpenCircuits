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
