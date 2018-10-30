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
	
	constructor() {
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
	 * Add a propogation request to the queue.
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
			// setTimeout(update, PROPAGATION_TIME);
			this.update();
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
			// setTimeout(update, PROPAGATION_TIME)
			this.update();
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
		var wire = new Wire(c1.getOutput(i1), c2.getInput(i2));
		this.wires.push(wire);
		
		c1.connect(i1, wire);
		c2.setInput(i2, wire);
	}
	
	removeObject(obj: Component): void {
		if (!this.objects.includes(obj))
			throw new Error("Attempted to remove object that doesn't exist!");
					
		// completely disconnect from the circuit
	}
	
	getObjects(): Array<Component> {
		return this.objects;
	}
	
	getWires(): Array<Wire> {
		return this.wires;
	}
	
}

module.exports = CircuitDesigner;