// @flow
var V = require("../../../utils/math/Vector").V;
var Gate = require("../Gate");

class SRFlipFlop extends Gate {
	clock: boolean = false;
	state: boolean = false;
	last_clock: boolean = false;

	constructor() {
		super(3, 2, V(60, 60));
	}

	// @Override
	activate(signal: boolean) {
		this.last_clock = this.clock;
		this.clock = this.inputs[1].isOn;
		var set = this.inputs[0].isOn;
		var reset = this.inputs[2].isOn;
		if (this.clock && !this.last_clock) {
			if (set && reset) {
				// undefined behavior
			} else if (set) {
				this.state = true;
			} else if (reset) {
				this.state = false;
			}
		}

		super.activate(this.state, 0);
		super.activate(!this.state, 1);
	}

	getDisplayName() {
		return "SR Flip Flop";
	}

	getImageName() {
		return "flipflop.svg";
	}
	static getXMLName() {
		return "srflipflop";
	}
}

module.exports = SRFlipFlop;
