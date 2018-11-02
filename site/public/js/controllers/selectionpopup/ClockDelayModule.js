class ClockDelayModule extends Module {
    constructor(parent, divName, divTextName) {
        super(parent, divName, divTextName);
    }
    onShow() {
        console.log("Aaaaaaa");
        var allClocks = true, allSame = true;
        var selections = selectionTool.selections;
        for (var i = 0; i < selections.length; i++) {
            allClocks = allClocks && selections[i] instanceof Clock;
            if (allClocks)
                allSame = allSame && selections[i].frequency === selections[0].frequency;
        }
        console.log("clcoks: " + allClocks + " : " + allSame);
        this.setVisibility(allClocks ? "inherit" : "none");
        this.setValue(allClocks && allSame ? selections[0].frequency : 1000);
    }
    onClick() {
    }
    onChange() {
        var selections = selectionTool.selections;
        for (var i = 0; i < selections.length; i++){     
            var value = Number(this.getValue());
            if (value < this.div.min)
                selections[i].frequency = Number(this.div.min);
            else if (value > this.div.max)
                selections[i].frequency = Number(this.div.max);
            else 
                selections[i].frequency = Number(value);
        }
    }
    onFocus() {
        this.parent.focused = true;
    }
    onBlur() {
        this.parent.focused = false;
        this.onChange();
    }
}
