class DeleteAction extends Action {
    constructor(obj, oldinput, oldconnection) {
        super();
        this.obj = obj;
        this.oldinput = oldinput;
        this.oldconnection = oldconnection;
    }
    undo() {
        this.context.add(this.obj);
        if (this.oldinput != undefined)
            this.oldinput.connect(this.obj);
        if (this.oldconnection != undefined)
            this.obj.connect(this.oldconnection);
    }
    redo() {
        this.obj.remove();
    }
}
