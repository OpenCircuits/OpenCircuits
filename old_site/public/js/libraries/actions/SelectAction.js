class SelectAction extends Action {
    constructor(obj, flip) {
        super();
        this.obj = obj;
        this.flip = flip;
    }
    undo() {
        if (this.flip)
            this.reselect();
        else
            this.deselect();
    }
    redo() {
        if (this.flip)
            this.deselect();
        else
            this.reselect();
    }
    reselect() {
        selectionTool.select([this.obj]);
    }
    deselect() {
        selectionTool.deselect([this.obj]);
    }
}
