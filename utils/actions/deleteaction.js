class DeleteAction {
    constructor(obj, oldinput, oldconnection) {
        this.context = getCurrentContext();
        this.obj = obj;
        this.oldinput = oldinput;
        this.oldconnection = oldconnection;
    }
    undo() {
        this.context.add(this.obj);
        console.log(this.obj);
        console.log(this.oldinput);
        console.log(this.oldconnection);
        if (this.oldinput != undefined)
            this.oldinput.connect(this.obj);
        if (this.oldconnection != undefined)
            this.obj.connect(this.oldconnection);
    }
    redo() {
        this.obj.remove();
    }
}
