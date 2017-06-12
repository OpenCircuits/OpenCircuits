class ICDesigner {
    constructor() {
        this.canvas = document.getElementById("designerCanvas");

        this.designer = new CircuitDesigner(this.canvas, 0.84, 0.76);
        this.context = new Context(this.designer);

        this.hide();
    }
    getSelectionPos() {
        var midpoint = V(0, 0);
        for (var i = 0; i < this.selections.length; i++)
            midpoint.translate(this.selections[i].getPos());
        return midpoint.scale(1.0 / this.selections.length);
    }
    onMove() {
        if (this.selections.length > 0) {
            var pos = camera.getScreenPos(this.getSelectionPos());
            pos.y -= this.div.clientHeight;
            this.setPos(pos);
        }
    }
    onWheel() {
        this.onMove();
    }
    show() {
        currentContext = this.context;
        this.hidden = false;
        this.canvas.style.visibility = "visible";
        popup.hide();

        this.ic = createIC(this.context, selectionTool.selections, V(0, 0));
        this.designer.addObject(this.ic);
        selectionTool.deselect();
        render();
    }
    hide() {
        currentContext = context;
        this.hidden = true;
        this.canvas.style.visibility = "hidden";
        if (this.ic !== undefined) {
            this.ic.remove();
            this.ic = undefined;
        }
    }
}
