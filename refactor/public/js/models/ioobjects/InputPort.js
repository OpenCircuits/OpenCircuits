// @flow

var Component = require("./Component");
var Wire      = require("./Wire");

class InputPort {
	parent: Component;
	input: ?Wire;
	isOn: boolean;
	
	constructor(parent: Component) {
		this.parent = parent;
		this.input = undefined;
		this.isOn = false;
	}
	
	activate(signal: boolean) {
		// Don't do anything if signal is same as current state
		if (signal == this.isOn)
			return;
		
		this.isOn = signal;
		this.parent.getDesigner().propogate(this.parent, this.isOn);
	}
	
	setInput(input: Wire): void {
		this.input = input;
	}
	
}

module.exports = InputPort;