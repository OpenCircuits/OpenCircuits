// @flow
var V = require("../../../utils/math/Vector").V;
var Gate = require("../Gate");

class DFlipFlop extends Gate {
	clock: boolean = false;
	state: boolean = false;
	last_clock: boolean = false;

	constructor() {
		super(2, 2, V(60, 60));
	}

	// @Override
	activate(signal: boolean) {
		this.last_clock = this.clock;
		this.clock = this.inputs[0].isOn;
		var data = this.inputs[1].isOn;
		if (this.clock && !this.last_clock)
			this.state = data;

		super.activate(this.state, 1);
		super.activate(!this.state, 0);
	}

	getDisplayName() {
		return "D Flip Flop";
	}

	getImageName() {
		return "flipflop.svg";
	}
	static getXMLName() {
		return "dflipflop";
	}
}

module.exports = DFlipFlop;
