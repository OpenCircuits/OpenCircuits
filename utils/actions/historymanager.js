class HistoryManager {
    constructor() {
        this.undoQueue = [];
        this.redoQueue = [];
    }
    undo() {
        if (this.undoQueue.length > 0) {
            this.undoQueue[0].undo();
            this.redoQueue.push(this.undoQueue[0]);
            this.undoQueue[0].shift();
        }
    }
    redo() {
        if (this.redoQueue.length > 0) {
            this.redoQueue[0].redo();
            this.undoQueue.push(this.redoQueue[0]);
            this.redoQueue[0].shift();
        }
    }
}
