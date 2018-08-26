class Encoder extends Gate {
    constructor(context, x, y) {
        super(context, false, x, y, undefined);
    }
    onTransformChange() {
        this.transform.setSize(V(DEFAULT_SIZE, DEFAULT_SIZE));
        super.onTransformChange();
        this.transform.setSize(V(DEFAULT_SIZE, DEFAULT_SIZE/2*(2 << (this.outputs.length-1))));
    }
    setInputAmount(target) {
        target = clamp(target, 0, 8);
        super.setInputAmount(2 << (target-1));
        super.setOutputAmount(target);
    }
    getInputAmount() {
        return this.outputs.length;
    }
    activate(x) {
        var indx = -1;
        for (var i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i].isOn) {
                if (indx !== -1)
                    return; // undefined behavior
                indx = i;
            }
        }
        if (indx === -1)
            return; // undefined behavior
        for (var i = this.outputs.length-1; i >= 0; i--) {
            var num = 1 << i;
            if (num > indx) {
                this.outputs[i].activate(false);
            } else {
                this.outputs[i].activate(true);
                indx -= num;
            }
        }
    }
    draw() {
        super.draw();

        var renderer = this.context.getRenderer();
        this.localSpace();
        renderer.rect(0, 0, this.transform.size.x, this.transform.size.y, this.getCol(), this.getBorderColor());
        renderer.restore();
    }
    getMinInputFieldCount() {
        return 1;
    }
    getDisplayName() {
        return "Encoder";
    }
}
Encoder.getXMLName = function() { return "encoder"; }
Importer.types.push(Encoder);
