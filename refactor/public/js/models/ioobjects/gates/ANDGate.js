// @flow
var V = require("../../../utils/math/Vector").V;
var Gate = require("./Gate");

class ANDGate extends Gate {

	constructor(not: boolean = false) {
		super(not, 2, V(60, 60));
	}

	// @Override
	activate(signal: boolean) {
		var on = true;
		for (var i = 0; i < this.inputs.length; i++)
			on = (on && this.inputs[i].isOn);
		super.activate(on);
	}

	getDisplayName() {
		return this.not ? "NAND Gate" : "AND Gate";
	}

	getImageName() {
		return "and.svg";
	}
	static getXMLName() {
		return "andgate"
	}
}

module.exports = ANDGate;
