class RedoModule extends Module {
    constructor(parent, divName) {
        super(parent, divName);
    }
    onShow() {
        this.setDisabled(getCurrentContext().designer.history.redoStack.length == 0);
    }
    onClick() {
        this.parent.hide();
        getCurrentContext().designer.history.redo();
    }
}
