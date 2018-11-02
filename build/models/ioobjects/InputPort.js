"use strict";

var IO_PORT_LENGTH = require("../../utils/Constants").IO_PORT_LENGTH;
var Vector = require("../../utils/math/Vector");
var V = Vector.V;

var Component = require("./Component");
var Wire = require("./Wire");

class InputPort {

	constructor(parent) {
		this.parent = parent;
		this.input = undefined;
		this.isOn = false;

		this.origin = V(0, 0);
		this.target = V(-IO_PORT_LENGTH, 0);
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

	getOrigin() {
		return this.origin;
	}
	getTarget() {
		return this.target;
	}

}

module.exports = InputPort;