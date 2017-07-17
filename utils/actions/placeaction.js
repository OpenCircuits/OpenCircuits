class PlaceAction {
    constructor(obj) {
        this.context = getCurrentContext();
        this.obj = obj;
    }
    undo() {
        var index = this.context.getIndexOf(this.obj);
        this.context.getObjects().splice(index, 1);
    }
    redo() {
        this.context.addObject(this.obj);
    }
}
