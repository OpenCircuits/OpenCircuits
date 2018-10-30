"use strict";

var Component = require("./Component");
var Wire = require("./Wire");

class InputPort {

	constructor(parent) {
		this.parent = parent;
		this.input = undefined;
		this.isOn = false;
	}

	activate(signal) {
		// Don't do anything if signal is same as current state
		if (signal == this.isOn) return;

		this.isOn = signal;
		this.parent.getDesigner().propogate(this.parent, this.isOn);
	}

	setInput(input) {
		this.input = input;
	}

}

module.exports = InputPort;