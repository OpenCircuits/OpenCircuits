class SelectAllModule extends Module {
    constructor(parent, divName) {
        super(parent, divName);
    }
    onShow() {
        this.setDisabled(false);
    }
    onClick() {
        this.parent.hide();
        selectionTool.selectAll();
        render();
    }
}
