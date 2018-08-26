class PositionXModule extends Module {
    constructor(parent, divName) {
        super(parent, divName);
    }
    onShow() {
        var allSame = true;
        var selections = selectionTool.selections;
        for (var i = 0; i < selections.length; i++)
            allSame = allSame && selections[i].getPos().x === selections[0].getPos().x;
        this.setValue(allSame ? +(selections[0].getPos().x/GRID_SIZE - 0.5).toFixed(3) : "");
        this.setPlaceholder(allSame ? "" : "-");
    }
    onChange() {
        var action = new GroupAction();
        var selections = selectionTool.selections;
        for (var i = 0; i < selections.length; i++) {
            if (!selections[i].transform) {
                this.onShow(); // Update value before exiting
                return;
            }
            var origin = selections[i].transform.copy();
            selections[i].setPos(V(GRID_SIZE*(Number(this.getValue())+0.5), selections[i].transform.getPos().y));
            var target = selections[i].transform.copy();
            action.add(new TransformAction(selections[i], origin, target));
        }
        getCurrentContext().addAction(action);
    }
}
