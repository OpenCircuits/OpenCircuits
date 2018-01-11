class ICDesigner {
    constructor() {
        this.canvas = document.getElementById("designer-canvas");

        this.designer = new CircuitDesigner(this.canvas, 0.84, 0.76);
        this.context = new Context(this.designer);

        this.ic = undefined;
        this.data = undefined;

        this.drag = false;
        this.dragObj = undefined;

        this.dragEdge = undefined;
        
        this.disabled = true;

        this.confirmButton = document.getElementById("ic-confirmbutton");
        this.cancelButton = document.getElementById("ic-cancelbutton");

        this.hide();
    }
    confirm() {
        if (this.ic != undefined) {
            ICData.add(this.data);
            var out = this.ic.copy();
            out.setContext(context);
            context.getDesigner().addObject(out);
            this.hide();
        }
    }
    cancel() {
        if (this.ic != undefined) {
            this.hide();
        }
    }
    show(selections) {
        currentContext = this.context;
        this.disabled = false;
        TransformController.disabled = true;
        WireController.disabled = true;
        SelectionBox.disabled = true;
        
        this.hidden = false;
        this.canvas.style.visibility = "visible";
        this.confirmButton.style.visibility = "visible";
        this.cancelButton.style.visibility = "visible";
        if (ItemNavController.isOpen)
            ItemNavController.toggle();
        popup.hide();

        this.data = ICData.create(selections);
        this.ic = new IC(this.context, this.data, 0, 0);

        this.designer.addObject(this.ic);
        selectionTool.deselectAll();
        this.context.getCamera().zoom = 0.5 + 0.1*(this.ic.transform.size.x-50)/20;
        render();
    }
    hide() {
        currentContext = context;
        this.disabled = true;
        TransformController.disabled = false;
        WireController.disabled = false;
        SelectionBox.disabled = false;
        
        this.hidden = true;
        this.canvas.style.visibility = "hidden";
        this.confirmButton.style.visibility = "hidden";
        this.cancelButton.style.visibility = "hidden";
        if (this.ic != undefined) {
            this.ic.remove();
            this.ic = undefined;
            this.data = undefined;
        }
        render();
    }
    onMouseDown() {
        if (this.ic == undefined)
            return false;

        var worldMousePos = Input.getWorldMousePos();

        var inputs = this.ic.inputs;
        for (var i = 0; i < inputs.length; i++) {
            var inp = inputs[i];
            if (inp.sContains(worldMousePos)) {
                this.drag = true;
                this.dragObj = this.data.iports[i];
                return true;
            }
        }
        var outputs = this.ic.outputs;
        for (var i = 0; i < outputs.length; i++) {
            var out = outputs[i];
            if (out.sContains(worldMousePos)) {
                this.drag = true;
                this.dragObj = this.data.oports[i];
                return true;
            }
        }

        var pos = this.ic.getPos();
        var size = this.ic.getSize();
        var transform1 = new Transform(pos, size.scale(1.2), 0, this.context.getCamera());
        var transform2 = new Transform(pos, size.scale(0.8), 0, this.context.getCamera());
        if (rectContains(transform1, worldMousePos) && !rectContains(transform2, worldMousePos)) {
            if (worldMousePos.y < pos.y+size.y/2-4 && worldMousePos.y > pos.y-size.y/2+4) {
                this.dragEdge = "horizontal";
            } else {
                this.dragEdge = "vertical";
            }
            return true;
        }
    }
    onMouseUp() {
        if (this.ic == undefined)
            return false;

        this.drag = false;
        this.dragObj = undefined;
        this.dragEdge = undefined;
    }
    onMouseMove() {
        if (this.ic == undefined)
            return false;

        var worldMousePos = Input.getWorldMousePos();

        if (this.drag) {
            var size = this.ic.getSize();
            var p = getNearestPointOnRect(V(-size.x/2, -size.y/2), V(size.x/2, size.y/2), worldMousePos);
            var v1 = p.sub(worldMousePos).normalize().scale(size.scale(0.5)).add(p);
            var v2 = p.sub(worldMousePos).normalize().scale(size.scale(0.5).sub(V(IO_PORT_LENGTH+size.x/2-25, IO_PORT_LENGTH+size.y/2-25))).add(p);
            this.dragObj.setOrigin(v1);
            this.dragObj.setTarget(v2);

            this.ic.update();

            return true;
        }
        if (this.dragEdge != undefined) {
            if (this.dragEdge === "horizontal") {
                this.data.transform.setWidth(Math.abs(2*worldMousePos.x));
            } else {
                this.data.transform.setHeight(Math.abs(2*worldMousePos.y));
            }
            this.data.recalculatePorts();

            this.ic.update();

            return true;
        }
    }
    onClick() {
    }
}
