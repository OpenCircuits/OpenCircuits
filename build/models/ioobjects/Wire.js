"use strict";

var IOObject = require("./IOObject");
var OutputPort = require("./OutputPort");
var InputPort = require("./InputPort");

class Wire extends IOObject {

	constructor(input, output) {
		super();

		this.input = input;
		this.output = output;
	}

	// @Override
	activate(signal) {
		// Don't do anything if signal is same as current state
		if (signal == this.isOn) return;

		this.isOn = signal;
		if (this.output != null) this.output.activate(signal);
	}

	setInput(c) {
		this.input = c;
	}

	setOutput(c) {
		this.output = c;
	}

}

module.exports = Wire;