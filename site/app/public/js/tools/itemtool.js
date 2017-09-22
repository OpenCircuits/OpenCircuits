class ItemTool extends Tool {
    constructor() {
        super();
        this.item = undefined;
    }
    activate(object, context) {
        // If already active, remove current
        if (this.item != undefined)
            context.remove(this.item);

        super.activate();
        this.item = object;
        context.addObject(this.item);
        this.onMouseMove(context.getInput());
    }
    deactivate() {
        super.deactivate();
        this.item = undefined;
    }
    onMouseMove(input) {
        this.item.setPos(input.worldMousePos);
        return true;
    }
    onClick() {
        var action = new PlaceAction(this.item);
        getCurrentContext().addAction(action);
        selectionTool.activate();
    }
}
