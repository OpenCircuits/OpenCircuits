"use strict";

var V = require("../../../utils/math/Vector").V;
var Component = require("../Component");

class Switch extends Component {

	constructor() {
		super(0, 1, true, V(60, 60));
	}

	// @Override
	activate(signal) {
		super.activate(signal, 0);
	}

	getImageName() {
		return "switchUp.svg";
	}
}

module.exports = Switch;