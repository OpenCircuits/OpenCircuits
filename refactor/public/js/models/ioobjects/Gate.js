// @flow
var Vector = require("../../utils/math/Vector");
var V = Vector.V;

var Component = require("./Component");

class Gate extends Component {
    not: boolean;
    
    constructor(numInputs: number, numOutputs: number, size: Vector = V(1, 1)) {
        super(numInputs, numOutputs, false, size);
    }
}

module.exports = Gate;