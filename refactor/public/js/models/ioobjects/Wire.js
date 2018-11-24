// @flow

var IOObject   = require("./IOObject");
var Component  = require("./Component");
var OutputPort = require("./OutputPort");
var InputPort  = require("./InputPort");

class Wire extends IOObject {
    input: OutputPort;
    output: InputPort;
    isOn: boolean;

	constructor(input: OutputPort, output: InputPort) {
        super();

		this.input = input;
		this.output = output;
	}

    // @Override
	activate(signal: boolean): void {
		// Don't do anything if signal is same as current state
		if (signal == this.isOn)
			return;

		this.isOn = signal;
		if (this.output != null)
			this.output.activate(signal);
	}

	setInput(c: OutputPort): void {
		this.input = c;
	}

	setOutput(c: InputPort): void {
		this.output = c;
	}

    getInputComponent(): Component {
        return this.input.parent;
    }

    getOutputComponent(): Component {
        return this.output.parent;
    }

}

module.exports = Wire;
