class SRFlipFlop extends Gate {
    constructor(context, x, y) {
        super(context, false, x, y, images["base.svg"]);
        this.noChange = true;
        this.setInputAmount(3);
        this.setOutputAmount(2);
        this.transform.setSize(this.transform.size.scale(1.5));
    }
    setInputAmount(target) {
        super.setInputAmount(target);

        for (var i = 0; i < this.inputs.length; i++) {
            var input = this.inputs[i];
            input.origin = V(-(this.transform.size.x-2)/2, input.origin.y);
        }
    }
    activate(x) {
        var on = this.outputs[0].isOn;

        var set = this.inputs[0].isOn;
        var clock = this.inputs[1].isOn;
        var reset = this.inputs[2].isOn;
        if (clock) {
            if (set && reset) {
                // undefined behavior
            } else if (set) {
                on = true;
            } else if (reset) {
                on = false;
            }
        }

        super.activate(on, 0);
        super.activate(!on, 1);
    }
    draw() {
        var renderer = this.context.getRenderer();

        this.localSpace();
        var l1 = -(this.transform.size.y/2)*(0.5-this.inputs.length/2);
        var l2 = -(this.transform.size.y/2)*(this.inputs.length/2-0.5);

        var s = (this.transform.size.x-2)/2;
        var p1 = V(-s, l1);
        var p2 = V(-s, l2);

        renderer.line(p1.x, p1.y, p2.x, p2.y, this.getBorderColor(), 2);
        renderer.restore();

        super.draw();

    }
    getDisplayName() {
        return "SR Flip Flop";
    }
}
