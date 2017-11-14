class ICButtonModule extends Module {
    constructor(parent, divName) {
        super(parent, divName);
    }
    onShow() {
        var count = 0;
        var selections = selectionTool.selections;
        for (var i = 0; i < selections.length; i++) {
            if (selections[i] instanceof IOObject && !(selections[i] instanceof WirePort))
                count++;
        }
        this.setVisibility(count >= 2 ? "inherit" : "none");
    }
    onClick() {
        icdesigner.show(selectionTool.selections);
    }
}
