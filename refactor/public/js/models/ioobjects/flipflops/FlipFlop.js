// @flow
var Vector = require("../../../utils/math/Vector");
var V = Vector.V;

var Component = require("../Component");

//
// FlipFlop is an abstract superclass for general flip flops.
//
class FlipFlop extends Component {
	clock: boolean = false;
	state: boolean = false;
	last_clock: boolean = false;

    constructor(numInputs: number, numOutputs: number, size: Vector) {
        super(numInputs, numOutputs, false, size);
    }

}

module.exports = FlipFlop;
