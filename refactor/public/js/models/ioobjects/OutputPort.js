// @flow
var IO_PORT_LENGTH = require("../../utils/Constants").IO_PORT_LENGTH;
var Vector = require("../../utils/math/Vector");
var V = Vector.V;

var Component = require("./Component");
var Wire      = require("./Wire");

class OutputPort {
	parent: Component;
    connections: Array<Wire>;
    isOn: boolean;

	origin: Vector;
	target: Vector;

	constructor(parent: Component) {
		this.parent = parent;
		this.connections = [];
		this.isOn = false;

		this.origin = V(0, 0);
		this.target = V(IO_PORT_LENGTH, 0);
	}

	activate(signal: boolean): void {
		// Don't do anything if signal is same as current state
		if (signal == this.isOn)
			return;

		this.isOn = signal;
		for (var w of this.connections)
			this.parent.getDesigner().propogate(w, this.isOn);
	}

	connect(w: Wire): void {
		this.connections.push(w);
		w.activate(this.isOn);
	}

	getOrigin(): Vector {
		return this.origin;
	}
	getTarget(): Vector {
		return this.target;
	}

}

module.exports = OutputPort;
