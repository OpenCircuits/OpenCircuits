class IC extends Gate {
    constructor(x, y, inputs, outputs, components) {
        super(false, x, y, undefined);
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
        super.draw();

        this.localSpace();

        rect(0, 0, 50, 50, '#ffffff', '#000000', 1);

        restoreCtx();
    }
    getDisplayName() {
        return "IC";
    }
}

function createIC() {
    var selections = selectionTool.selections;

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
        objects.splice(getIndexOfObject(selections[i]), 1);

        for (var j = 0; j < selection.outputs.length; j++) {
            var oport = selection.outputs[j];
            for (var k = 0; k < oport.connections.length; k++) {
                wires.splice(getIndexOfWire(oport.connections[k]), 1);
            }
        }
        for (var j = 0; j < selection.inputs.length; j++) {
            var iport = selection.inputs[j];
            if (iport.input !== undefined)
                wires.splice(getIndexOfWire(iport.input), 1);
        }
    }

    var pos = selectionTool.midpoint;

    selectionTool.deselect();

    objects.push(new IC(pos.x, pos.y, inputs, outputs, components));

    render();
}
