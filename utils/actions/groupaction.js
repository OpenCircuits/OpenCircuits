class GroupAction extends Action {
    constructor() {
        super();
        this.actions = [];
    }
    add(action) {
        this.actions.push(action);
    }
    undo() {
        for (var i = this.actions.length-1; i >= 0; i--)
            this.actions[i].undo();
    }
    redo() {
        for (var i = 0; i < this.actions.length; i++)
            this.actions[i].redo();
    }
}
