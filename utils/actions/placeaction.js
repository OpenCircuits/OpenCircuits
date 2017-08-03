class PlaceAction {
    constructor(obj) {
        this.context = getCurrentContext();
        this.obj = obj;
    }
    undo() {
        this.context.remove(this.obj);
    }
    redo() {
        this.context.addObject(this.obj);
    }
}
