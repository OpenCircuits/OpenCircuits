class ColorPickerModule extends Module {
    constructor(parent, divName, divTextName) {
        super(parent, divName, divTextName);
    }
    onShow() {
        var allLEDs = true, allSame = true;
        var selections = selectionTool.selections;
        for (var i = 0; i < selections.length; i++) {
            allLEDs = allLEDs && selections[i] instanceof LED;
            if (allLEDs)
                allSame = allSame && selections[i].color === selections[0].color;
        }
        this.setVisibility(allLEDs ? "inherit" : "none");
        this.setValue(allLEDs && allSame ? selections[0].color : '#ffffff');
    }
    onChange() {
        var selections = selectionTool.selections;
        for (var i = 0; i < selections.length; i++)
            selections[i].color = this.getValue();
    }
    onFocus() {
        this.parent.focused = true;
    }
    onBlur() {
        this.parent.focused = false;
        this.onChange();
    }
}
