class ItemTool extends Tool {
    constructor() {
        super();
        this.item = undefined;
    }
    activate(object) {
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
        this.onMouseMove();
    }
    deactivate() {
        super.deactivate();
        this.item = undefined;
    }
    onMouseMove() {
        this.item.x = worldMousePos.x;
        this.item.y = worldMousePos.y;
        render();
    }
    onClick() {
        selectionTool.activate();
    }
}
