class BusButtonModule extends Module {
    constructor(parent, divName) {
        super(parent, divName);
    }
    onShow() {
        var iports = 0, oports = 0;
        var selections = selectionTool.selections;
        for (var i = 0; i < selections.length; i++) {
            if (selections[i] instanceof IPort) {
                iports++;
            } else if (selections[i] instanceof OPort) {
                oports++;
            } else {
                this.setVisibility("none");
                return;
            }
        }
        this.setVisibility(iports === oports ? "inherit" : "none");
    }
    onClick() {
        selectionTool.createBus();
    }
}
