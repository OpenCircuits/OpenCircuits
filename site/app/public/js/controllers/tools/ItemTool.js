class ItemTool extends Tool {
    constructor() {
        super();
        this.item = undefined;
    }
    activate(object, context) {
        // If already active, remove current item
        if (this.item != undefined)
            context.remove(this.item);

        super.activate();
        this.item = object;
        context.addObject(this.item);
        this.onMouseMove();
    }
    deactivate() {
        super.deactivate();
        this.item = undefined;
    }
    onMouseMove() {
        this.item.setPos(Input.getWorldMousePos());
        return true;
    }
    onClick() {
        this.item.setPos(Input.getWorldMousePos());
        var action = new PlaceAction(this.item);
        getCurrentContext().addAction(action);
        selectionTool.activate();
        return true;
    }
}
var itemTool = new ItemTool();
