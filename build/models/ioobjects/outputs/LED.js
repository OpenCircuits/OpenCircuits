"use strict";

var V = require("../../../utils/math/Vector").V;
var Component = require("../Component");

class LED extends Component {

	constructor() {
		super(1, 0, false, V(60, 60));
	}

	isOn() {
		return this.inputs[0].isOn;
	}

	getImageName() {
		return "led.svg";
	}
}

module.exports = LED;