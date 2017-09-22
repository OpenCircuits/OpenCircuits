class InputCountModule extends Module {
    constructor(parent, divName, divTextName) {
        super(parent, divName, divTextName);
    }
    onShow() {
        var allSame = true, display = true;
        var maxMinValue = 0;
        var minMaxValue = 999;
        var selections = selectionTool.selections;
        for (var i = 0; i < selections.length; i++) {
            display = display && (selections[i].maxInputs > 1 && selections[i].noChange !== true);
            allSame = allSame && selections[i].getInputAmount() === selections[0].getInputAmount();
            maxMinValue = Math.max(selections[i].getMinInputFieldCount(), maxMinValue);
            minMaxValue = Math.min(selections[i].getMaxInputFieldCount(), minMaxValue);
        }
        this.setValue(allSame ? selections[0].getInputAmount() : "");
        this.setPlaceholder(allSame ? "" : "-");
        this.setVisibility(display ? "inherit" : "none");
        this.div.min = maxMinValue;
        this.div.max = minMaxValue;
    }
    onChange() {
        var selections = selectionTool.selections;
        for (var i = 0; i < selections.length; i++)
            selections[i].setInputAmount(Number(this.getValue()));
    }
}
