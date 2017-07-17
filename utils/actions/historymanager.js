class HistoryManager {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
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
            render();
        }
    }
    redo() {
        if (this.redoStack.length > 0) {
            var action = this.redoStack.pop();
            action.redo();
            this.undoStack.push(action);
            render();
        }
    }
}
