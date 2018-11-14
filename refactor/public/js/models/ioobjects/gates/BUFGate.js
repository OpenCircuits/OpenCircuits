// @flow
var V = require("../../../utils/math/Vector").V;
var Gate = require("../Gate");

class BUFGate extends Gate {

	constructor() {
		super(1, 1, V(60, 60));
	}

	// @Override
	activate(signal: boolean) {
		var on = false;
		for (var i = 0; i < this.inputs.length; i++)
			on = this.inputs[i].isOn;
		super.activate(on);
	}

	getDisplayName() {
		return this.not ? "NOT Gate" : "Buffer Gate";
	}

	getImageName() {
		return "buf.svg";
	}
	static getXMLName() {
		return "bufgate"
	}
}

module.exports = BUFGate;
