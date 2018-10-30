"use strict";

var IOObject = require("./ioobjects/IOObject");

class Propagation {

	constructor(receiver, signal) {
		this.receiver = receiver;
		this.signal = signal;
	}

	send() {
		this.receiver.activate(this.signal);
	}

}

module.exports = Propagation;