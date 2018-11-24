// @flow

var Propagation = require("./Propagation");

var IOObject  = require("./ioobjects/IOObject");
var Component = require("./ioobjects/Component");
var Wire      = require("./ioobjects/Wire");

class CircuitDesigner {
	objects: Array<Component>;
	wires: Array<Wire>;
	propagationQueue: Array<Propagation>;
	updateRequests: number;
	propagationTime: number;

	constructor(propagationTime: number = 1) {
		this.propagationTime = propagationTime;
		this.objects = [];
		this.wires   = [];
		this.propagationQueue = [];
		this.updateRequests = 0;
	}

	reset(): void {
		this.objects = [];
		this.wires = [];
		this.propagationQueue = [];
		this.updateRequests = 0;
	}

	/**
	 * Add a propagation request to the queue.
	 * Also checks if there are currently no requests and starts the cycle if
	 *  there aren't
	 *
	 * @param sender
	 * @param receiver
	 * @param signal
	 */
	propogate(receiver: IOObject, signal: boolean): void {
		this.propagationQueue.push(new Propagation(receiver, signal));

		if (this.updateRequests == 0) {
			this.updateRequests++;

			// instant propagation
			if (this.propagationTime == 0)
				this.update();
			else
				setTimeout(() => this.update(), this.propagationTime);
		}
	}

	/**
	 *
	 * @return True if the updated component(s) require rendering
	 */
	update(): boolean {
		// Create temp queue before sending, in the case that sending them triggers
		//   more propagations to occur
		var tempQueue = [];
		while (this.propagationQueue.length > 0)
			tempQueue.push(this.propagationQueue.pop());

		while (tempQueue.length > 0)
			tempQueue.pop().send();

		// If something else was added during the sending, add request
		if (this.propagationQueue.length > 0)
			this.updateRequests++;


		this.updateRequests--;

		if (this.updateRequests > 0) {
			if (this.propagationTime == 0)
				this.update();
			else
				setTimeout(() => this.update(), this.propagationTime);
		}

		return true;
	}

	addObjects(objects: Array<Component>): void {
		for (var i = 0; i < objects.length; i++)
			this.addObject(objects[i]);
	}

	addObject(obj: Component): void {
		if (this.objects.includes(obj))
			throw new Error("Attempted to add object that already existed!");

		obj.setDesigner(this);
		this.objects.push(obj);
	}

	connect(c1: Component, i1: number, c2: Component, i2: number): void {
		var wire = new Wire(c1.getOutputPort(i1), c2.getInputPort(i2));
		this.wires.push(wire);

		wire.setDesigner(this);
		c1.connect(i1, wire);
		c2.setInput(i2, wire);
	}

	removeObject(obj: Component): void {
		if (!this.objects.includes(obj))
			throw new Error("Attempted to remove object that doesn't exist!");

		// completely disconnect from the circuit
		this.objects.splice(this.objects.indexOf(obj), 1);
		obj.setDesigner(undefined);
	}

	removeWire(wire: Wire): void {
		if (!this.wires.includes(wire))
			throw new Error("Attempted to remove wire that doesn't exist!");

		// completely disconnect from the circuit
		this.wires.splice(this.wires.indexOf(wire), 1);
		wire.setDesigner(undefined);
	}

	getObjects(): Array<Component> {
		return this.objects;
	}

	getWires(): Array<Wire> {
		return this.wires;
	}

}

module.exports = CircuitDesigner;
