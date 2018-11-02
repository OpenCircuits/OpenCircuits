"use strict";

var IO_PORT_LENGTH = require("../../utils/Constants").IO_PORT_LENGTH;
var Vector = require("../../utils/math/Vector");
var V = Vector.V;

var Component = require("./Component");
var Wire = require("./Wire");

class OutputPort {

	constructor(parent) {
		this.parent = parent;
		this.connections = [];
		this.isOn = false;

		this.origin = V(0, 0);
		this.target = V(IO_PORT_LENGTH, 0);
	}

	activate(signal) {
		// Don't do anything if signal is same as current state
		if (signal == this.isOn) return;

		this.isOn = signal;
		for (var w of this.connections) this.parent.getDesigner().propogate(w, this.isOn);
	}

	connect(w) {
		this.connections.push(w);
	}

	getOrigin() {
		return this.origin;
	}
	getTarget() {
		return this.target;
	}

}

module.exports = OutputPort;