class BUFGate extends Gate {
    constructor(not, x, y) {
        super(not, x, y, images["buffer.svg"]);
        this.maxInputs = 1;

        this.setInputAmount(1);
    }
    activate(x) {
        var on = false;
        for (var i = 0; i < this.inputs.length; i++)
            on = this.inputs[i].isOn;
        super.activate(on);
    }
    getDisplayName() {
        return this.not ? "NOT Gate" : "Buffer Gate";
    }
}
