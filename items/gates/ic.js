class IC extends Gate {
    constructor(context, x, y, inputs, outputs, components) {
        super(context, false, x, y, undefined);
        this.inputObjects = inputs;
        this.outputObjects = outputs;
        this.components = components;
        this.noChange = true;

        this.maxInputs = inputs.length;
        this.maxOutputs = outputs.length;
        this.setInputAmount(inputs.length);
        this.setOutputAmount(outputs.length);

        var ic = this;
        for (var i = 0; i < outputs.length; i++) {
            var ii = i;
            outputs[i].activate = function(on, j) {
                ic.outputs[ii].activate(on);
            }
        }

        this.activate();
    }
    activate() {
        for (var i = 0; i < this.inputs.length; i++) {
            console.log(this.inputs[i].isOn);
            this.inputObjects[i].activate(this.inputs[i].isOn);
        }
    }
    draw() {
        var renderer = this.context.getRenderer();

        super.draw();

        this.localSpace();

        renderer.rect(0, 0, 50, 50, '#ffffff', '#000000', 1);

        renderer.restore();
    }
    getDisplayName() {
        return "IC";
    }
}

function createIC(context, selections, pos) {
    var inputs = [];
    var outputs = [];
    var components = [];
    for (var i = 0; i < selections.length; i++) {
        var selection = selections[i];
        if (selection instanceof Switch || selection instanceof Button)
            inputs.push(selection);
        else if (selection instanceof LED)
            outputs.push(selection);
        else
            components.push(selection);
    }

    return new IC(context, pos.x, pos.y, inputs, outputs, components);
}
