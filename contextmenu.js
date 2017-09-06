class ContextMenu extends Menu {
    constructor() {
        super("contextMenu");

        this.cut = document.getElementById("contextCut");
        this.copy = document.getElementById("contextCopy");
        this.paste = document.getElementById("contextPaste");
        this.selectall = document.getElementById("contextSelectAll");

        this.undo = document.getElementById("contextUndo");
        this.redo = document.getElementById("contextRedo");
    }
    show(e) {
        super.show();

        this.setPos(V(e.clientX, e.clientY));

        this.cut.disabled = (this.copy.disabled = (selectionTool.selections.length == 0));
        this.paste.disabled = false;

        this.selectall.disabled = false;

        this.undo.disabled = (getCurrentContext().designer.history.undoStack.length == 0);
        this.redo.disabled = (getCurrentContext().designer.history.redoStack.length == 0);
    }
}
