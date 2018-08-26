class TitleModule extends Module {
    constructor(parent, divName) {
        super(parent, divName);
    }
    onShow() {
        var allSame = true;
        var selections = selectionTool.selections;
        for (var i = 0; i < selections.length; i++)
            allSame = allSame && selections[i].getName() === selections[0].getName();
        this.setValue(allSame ? selections[0].getName() : "<Multiple>");
    }
    onChange() {
        var selections = selectionTool.selections;
        for (var i = 0; i < selections.length; i++)
            selections[i].setName(this.getValue());
    }
    onFocus() {
        this.parent.focused = true;
    }
    onBlur() {
        this.parent.focused = false;
        this.onChange();
    }
}
