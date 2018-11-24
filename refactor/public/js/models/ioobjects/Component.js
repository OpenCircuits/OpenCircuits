// @flow
var Vector = require("../../utils/math/Vector");
var Transform = require("../../utils/math/Transform");
var V = Vector.V;

var IOObject   = require("./IOObject")
var Wire       = require("./Wire");
var InputPort  = require("./InputPort")
var OutputPort = require("./OutputPort")

class Component extends IOObject {
    inputs: Array<InputPort>;
    outputs: Array<OutputPort>;

    transform: Transform;

    // constructor(context, x, y, w, h, img, isPressable, maxInputs, maxOutputs, selectionBoxWidth, selectionBoxHeight) {
	constructor(numInputs: number, numOutputs: number, isPressable: boolean, size: Vector = V(1, 1)) {
        super();

		this.inputs = [];
		this.outputs = [];

        this.transform = new Transform(V(0,0), size, 0);

		// Create and initialize each port
		for (var i = 0; i < numInputs; i++)
			this.inputs.push(new InputPort(this));
		for (var i = 0; i < numOutputs; i++)
			this.outputs.push(new OutputPort(this));
	}

	// @Override
	activate(signal: boolean, i: number = 0): void {
		// Don't try to activate an Output component since it has no outputs
		if (this.outputs.length == 0)
			return;

		this.outputs[i].activate(signal);
	}

	connect(i: number, w: Wire) : void{
		this.outputs[i].connect(w);
	}

	setInput(i: number, w: Wire): void {
		this.inputs[i].setInput(w);
	}

    setPos(v: Vector): void {
        this.transform.setPos(v);
    }

	getInputPort(i: number): InputPort {
		return this.inputs[i];
	}

    getInputPortCount(): number {
        return this.inputs.length;
    }

	getOutputPort(i: number): OutputPort {
		return this.outputs[i];
	}

    getOutputPortCount(): number {
        return this.outputs.length;
    }

    getInputs(): Array<Wire> {
        var arr = [];
        for (var i = 0; i < this.inputs.length; i++) {
            var input = this.inputs[i].getInput();
            if (input != undefined)
                arr.push(input);
        }
        return arr;
    }

    getOutputs(): Array<Wire> {
        var arr = [];
        for (var i = 0; i < this.outputs.length; i++)
            arr = arr.concat(this.outputs[i].getConnections());
        return arr;
    }

    getTransform(): Transform {
        return this.transform;
    }

	getImageName() {
		return "base.svg";
	}
}

module.exports = Component;
