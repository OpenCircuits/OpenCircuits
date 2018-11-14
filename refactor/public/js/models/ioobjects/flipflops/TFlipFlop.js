// @flow
var V = require("../../../utils/math/Vector").V;
var FlipFlop = require("./FlipFlop");

class TFlipFlop extends FlipFlop {
	
	constructor() {
		super(2, 2, V(60, 60));
	}

	// @Override
	activate(signal: boolean) {
		this.last_clock = this.clock;
		this.clock = this.inputs[0].isOn;
		var toggle = this.inputs[1].isOn;
		if (this.clock && !this.last_clock && toggle)
			this.state = !this.state;

		super.activate(this.state, 0);
		super.activate(!this.state, 1);
	}

	getDisplayName() {
		return "T Flip Flop";
	}

	getImageName() {
		return "flipflop.svg";
	}
	static getXMLName() {
		return "srflipflop";
	}
}

module.exports = TFlipFlop;
