class PlaceAction extends Action {
    constructor(obj) {
        super();
        this.obj = obj;
    }
    undo() {
        this.context.remove(this.obj);
    }
    redo() {
        this.context.addObject(this.obj);
    }
}
