// @flow
var IO_PORT_LENGTH = require("../../utils/Constants").IO_PORT_LENGTH;
var Vector = require("../../utils/math/Vector");
var V = Vector.V;

var Component = require("./Component");
var Wire      = require("./Wire");

class InputPort {
	parent: Component;
	input: ?Wire;
	isOn: boolean;

	origin: Vector;
	target: Vector;

	constructor(parent: Component) {
		this.parent = parent;
		this.input = undefined;
		this.isOn = false;

		this.origin = V(0, 0);
		this.target = V(-IO_PORT_LENGTH, 0);
	}

	activate(signal: boolean) {
		// Don't do anything if signal is same as current state
		if (signal == this.isOn)
			return;
		this.isOn = signal;

		// Get designer to propagte signal, exit if undefined
		var designer = this.parent.getDesigner();
		if (designer == undefined)
			return;

		designer.propogate(this.parent, this.isOn);
	}

	setInput(input: Wire): void {
		this.input = input;
	}

	getOrigin(): Vector {
		return this.origin;
	}
	getTarget(): Vector {
		return this.target;
	}

	getInput(): ?Wire {
		return this.input;
	}

}

module.exports = InputPort;
