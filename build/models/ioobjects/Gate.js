"use strict";

var Vector = require("../../utils/math/Vector");
var V = Vector.V;

var Component = require("./Component");

class Gate extends Component {

    constructor(numInputs, numOutputs, size = V(1, 1)) {
        super(numInputs, numOutputs, false, size);
    }
}

module.exports = Gate;