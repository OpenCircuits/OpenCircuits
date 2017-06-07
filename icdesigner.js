class ICDesigner {
    constructor() {
        this.div = document.getElementById("icDesigner");

        this.canvas = document.getElementById("designerCanvas");

        this.canvas.width = this.div.clientWidth;
        this.canvas.height = this.div.clientHeight;
        this.context = this.canvas.getContext("2d");

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
        this.hidden = false;
        this.div.style.visibility = "visible";
        popup.hide();

        // Load inputs and outputs
        var components = selectionTool.selections;
        this.inputs = [];
        this.outputs = [];
        for (var i = 0; i < components.length; i++) {
            var component = components[i];
            if (component instanceof Switch || component instanceof Button)
                this.inputs.push(component);
            else if (component instanceof LED)
                this.outputs.push(component);
        }
    }
    hide() {
        this.hidden = true;
        this.div.style.visibility = "hidden";
    }
    setPos(v) {
        this.pos = V(v.x, v.y);
        this.clamp();

        this.div.style.left = this.pos.x + "px";
        this.div.style.top = this.pos.y + "px";
    }
}
