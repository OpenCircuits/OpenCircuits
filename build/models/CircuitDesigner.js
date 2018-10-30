"use strict";

var Propagation = require("./Propagation");

var IOObject = require("./ioobjects/IOObject");
var Component = require("./ioobjects/Component");
var Wire = require("./ioobjects/Wire");

class CircuitDesigner {

	constructor() {
		this.objects = [];
		this.wires = [];
		this.propagationQueue = [];
		this.updateRequests = 0;
	}

	reset() {
		this.objects = [];
		this.wires = [];
		this.propagationQueue = [];
		this.updateRequests = 0;
	}

	/**
  * Add a propogation request to the queue.
  * Also checks if there are currently no requests and starts the cycle if
  *  there aren't
  * 
  * @param sender
  * @param receiver
  * @param signal
  */
	propogate(receiver, signal) {
		this.propagationQueue.push(new Propagation(receiver, signal));

		if (this.updateRequests == 0) {
			this.updateRequests++;
			// setTimeout(update, PROPAGATION_TIME);
			this.update();
		}
	}

	/**
  * 
  * @return True if the updated component(s) require rendering
  */
	update() {
		// Create temp queue before sending, in the case that sending them triggers
		//   more propagations to occur 
		var tempQueue = [];
		while (this.propagationQueue.length > 0) tempQueue.push(this.propagationQueue.pop());

		while (tempQueue.length > 0) tempQueue.pop().send();

		// If something else was added during the sending, add request
		if (this.propagationQueue.length > 0) this.updateRequests++;

		this.updateRequests--;

		if (this.updateRequests > 0) {
			// setTimeout(update, PROPAGATION_TIME)
			this.update();
		}

		return true;
	}

	addObjects(objects) {
		for (var i = 0; i < objects.length; i++) this.addObject(objects[i]);
	}

	addObject(obj) {
		if (this.objects.includes(obj)) throw new Error("Attempted to add object that already existed!");

		obj.setDesigner(this);
		this.objects.push(obj);
	}

	connect(c1, i1, c2, i2) {
		var wire = new Wire(c1.getOutput(i1), c2.getInput(i2));
		this.wires.push(wire);

		c1.connect(i1, wire);
		c2.setInput(i2, wire);
	}

	removeObject(obj) {
		if (!this.objects.includes(obj)) throw new Error("Attempted to remove object that doesn't exist!");

		// completely disconnect from the circuit
	}

	getObjects() {
		return this.objects;
	}

	getWires() {
		return this.wires;
	}

}

module.exports = CircuitDesigner;