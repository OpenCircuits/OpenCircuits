class ItemTool extends Tool {
    constructor() {
        super();
        this.item = undefined;
    }
    activate(object, context) {
        var objects = context.getObjects();
        var wires = context.getWires();

        if (this.item !== undefined) {
            for (var i = 0; i < objects.length; i++) {
                if (objects[i] === this.item) {
                    objects.splice(i, 1);
                    break;
                }
            }
        }
        super.activate();
        this.item = object;
        objects.push(this.item);
        this.onMouseMove(context.getInput());
    }
    deactivate() {
        super.deactivate();
        this.item = undefined;
    }
    onMouseMove(input) {
        this.item.setPos(input.worldMousePos);
        render();
    }
    onClick() {
        var action = new PlaceAction(this.item);
        getCurrentContext().addAction(action);
        selectionTool.activate();
    }
}
