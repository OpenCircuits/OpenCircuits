class CopyModule extends Module {
    constructor(parent, divName) {
        super(parent, divName);
    }
    onShow() {
        this.setDisabled(selectionTool.selections.length == 0);
    }
    onClick() {
        this.parent.hide();
        document.execCommand("copy");
    }
}
