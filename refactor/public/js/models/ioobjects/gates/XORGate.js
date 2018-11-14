// @flow
var V = require("../../../utils/math/Vector").V;
var Gate = require("../Gate");

class XORGate extends Gate {

	constructor() {
		super(2, 1, V(60, 60));
	}

	// @Override
	activate(signal: boolean) {
		var on = false;
		for (var i = 0; i < this.inputs.length; i++)
			on = (on !== this.inputs[i].isOn);
		super.activate(on);
	}

	getDisplayName() {
		return this.not ? "XNOR Gate" : "XOR Gate";
	}

	getImageName() {
		return "xor.svg";
	}
	static getXMLName() {
		return "xorgate";
	}
}

module.exports = XORGate;
