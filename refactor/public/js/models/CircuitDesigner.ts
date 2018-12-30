import {Propagation} from "./Propagation";

import {IOObject}  from "./ioobjects/IOObject";
import {Component} from "./ioobjects/Component";
import {Port}      from "./ioobjects/Port";
import {Wire}      from "./ioobjects/Wire";

export class CircuitDesigner {
	private objects: Array<Component>;
	private wires: Array<Wire>;
	private propagationQueue: Array<Propagation>;
	private updateRequests: number;
	private propagationTime: number;

	constructor(propagationTime: number = 1) {
		this.propagationTime = propagationTime;
		this.objects = [];
		this.wires   = [];
		this.propagationQueue = [];
		this.updateRequests = 0;
	}

	public reset(): void {
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
	public propogate(receiver: IOObject, signal: boolean): void {
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
	 * @return True if the updated component(s) require rendering
	 */
	private update(): boolean {
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

	public addObjects(objects: Array<Component>): void {
		for (var i = 0; i < objects.length; i++)
			this.addObject(objects[i]);
	}

	public addObject(obj: Component): void {
		if (this.objects.includes(obj))
			throw new Error("Attempted to add object that already existed!");

		obj.setDesigner(this);
		this.objects.push(obj);
	}

	public connect(c1: Component, i1: number, c2: Component, i2: number): Wire {
		// Make wire
		var wire = new Wire(c1.getOutputPort(i1), c2.getInputPort(i2));
		this.wires.push(wire);
		wire.setDesigner(this);

		// Connect components to wire
		c1.connect(i1, wire);
		c2.setInput(i2, wire);

		return wire;
	}

	public removeObject(obj: Component): void {
		if (!this.objects.includes(obj))
			throw new Error("Attempted to remove object that doesn't exist!");

		// Remove all input and output wires
		var inputs = obj.getInputs();
		var outputs = obj.getOutputs();
		var wires = inputs.concat(outputs);
		for (let wire of wires)
			this.removeWire(wire);

		this.objects.splice(this.objects.indexOf(obj), 1);
		obj.setDesigner(undefined);
	}

	public removeWire(wire: Wire): void {
		if (!this.wires.includes(wire))
			throw new Error("Attempted to remove wire that doesn't exist!");

		// Completely disconnect from the circuit
		wire.getInput().disconnect(wire);
		wire.getOutput().disconnect();

		this.wires.splice(this.wires.indexOf(wire), 1);
		wire.setDesigner(undefined);
	}

	public getObjects(): Array<Component> {
		return this.objects.slice(); // Shallow copy array
	}

	public getWires(): Array<Wire> {
		return this.wires.slice(); // Shallow copy array
	}

}
