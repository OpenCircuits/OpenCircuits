"use strict";

var Component = require("./Component");
var Wire = require("./Wire");

class OutputPort {

	constructor(parent) {
		this.parent = parent;
		this.isOn = false;
		this.connections = [];
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

}

module.exports = OutputPort;