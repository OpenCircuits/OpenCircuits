class PositionYModule extends Module {
    constructor(parent, divName) {
        super(parent, divName);
    }
    onShow() {
        var allSame = true;
        var selections = selectionTool.selections;
        for (var i = 0; i < selections.length; i++)
            allSame = allSame && selections[i].getPos().y === selections[0].getPos().y;
        this.setValue(allSame ? +(selections[0].getPos().y/GRID_SIZE - 0.5).toFixed(3) : "");
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
            selections[i].setPos(V(selections[i].transform.getPos().x, GRID_SIZE*(Number(this.getValue())+0.5)));
            var target = selections[i].transform.copy();
            action.add(new TransformAction(selections[i], origin, target));
        }
        getCurrentContext().addAction(action);
    }
}
