// @flow
var V = require("../../../utils/math/Vector").V;
var Gate = require("../Gate");

class TFlipFlop extends Gate {

    constructor() {
        super(2, 2, V(60,60))
        this.clock = false;
        this.last_clock = false;
        this.state = false;
    }

    // @Override
    activate(signal: boolean) {
		this.last_clock = this.clock;
        this.clock = this.inputs[0].isOn;
        var toggle = this.inputs[1].isOn;
        if (this.clock && !this.last_clock && toggle) {
            this.state = !this.state;
        }

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

modules.exports = TFlipFlop;
