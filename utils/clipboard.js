class Clipboard {
    constructor() {
        this.clipboard = undefined;
    }
    onKeyDown(code, input) {
        if (input.modiferKeyDown) {
            if (code === C_KEY) {
                this.copy();
                return;
            }
            if (code === X_KEY) {
                this.cut();
                return;
            }
            if (code === V_KEY) {
                this.paste();
                return;
            }
        }
    }
    copy() {
        var selections = selectionTool.selections;
        if (selections.length > 0)
            this.clipboard = copyGroup(selections);
    }
    cut() {
        var selections = selectionTool.selections;
        if (selections.length > 0) {
            this.copy();
            selectionTool.removeSelections();
        }
    }
    paste(input) {
        var context = getCurrentContext();
        if (this.clipboard != undefined) {
            var copy = copyGroup(this.clipboard.objects);
            var objects = copy.objects;
            var wires = copy.wires;
            var action = new GroupAction();
            for (var i = 0; i < objects.length; i++) {
                context.addObject(objects[i]);
                objects[i].setPos(objects[i].getPos().add(V(5,5)));
                action.add(new PlaceAction(objects[i]));
            }
            for (var i = 0; i < wires.length; i++) {
                context.addWire(wires[i]);
                action.add(new PlaceWireAction(wires[i]));
            }
            context.addAction(action);
            selectionTool.deselect();
            selectionTool.select(objects);
            render();
        }
    }
}
