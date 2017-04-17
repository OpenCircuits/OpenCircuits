class BUFGate extends Gate {
    constructor(not, x, y) {
        super(x, y, 1, 50, images["buffer.svg"], not);
        this.maxInputs = 1;
    }
    activate(x) {
        var on = false;
        for (var i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i] !== undefined && this.inputs[i].isOn) {
                on = true;
                break;
            }
        }
        super.activate(on);
    }
    getDisplayName() {
        return this.not ? "NOT Gate" : "Buffer Gate";
    }
}
