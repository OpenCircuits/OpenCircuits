import {CreateComponentFromXML} from "../utils/ComponentFactory";

import {XMLable} from "../utils/io/xml/XMLable";
import {XMLNode} from "../utils/io/xml/XMLNode";

import {Propagation} from "./Propagation";

import {IOObject}  from "./ioobjects/IOObject";
import {Component} from "./ioobjects/Component";
import {Wire}      from "./ioobjects/Wire";

export class CircuitDesigner implements XMLable {
	private objects: Array<Component>;
	private wires: Array<Wire>;
	private propagationQueue: Array<Propagation>;
	private updateRequests: number;
	private propagationTime: number;

	private updateCallback: () => void;

	public constructor(propagationTime: number = 1, callback: () => void = function(){}) {
		this.propagationTime = propagationTime;
		this.updateCallback = callback;

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

		this.updateCallback();

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

	public save(node: XMLNode): void {
		let objectsNode     = node.createChild("objects");
		let wiresNode       = node.createChild("wires");

		let idMap = new Map<IOObject, number>();

		let id = 0;
		for (let obj of this.objects) {
			let componentNode = objectsNode.createChild(obj.getXMLName());

			// Set and save XML ID for connections
			idMap.set(obj, id);
	        componentNode.addAttribute("xid", id);
			id++;

			// Save properties
			obj.save(componentNode);
		}

		for (let wire of this.wires) {
			let wireNode = wiresNode.createChild(wire.getXMLName());

			// Save properties
			wire.save(wireNode);

			let inputNode = wireNode.createChild("input");
			{
				let iPort = wire.getInput();
				let input = iPort.getParent();
				let iI = 0;
				// Find index of port
				while (iI < input.getOutputPortCount() &&
					   input.getOutputPort(iI) !== iPort) { iI++; }
				inputNode.addAttribute("xid", idMap.get(input));
				inputNode.addAttribute("index", iI);
			}
			let outputNode = wireNode.createChild("output");
			{
				let oPort = wire.getOutput();
				let input = oPort.getParent();
				let iO = 0;
				// Find index of port
				while (iO < input.getInputPortCount() &&
					   input.getInputPort(iO) !== oPort) { iO++; }
				outputNode.addAttribute("xid", idMap.get(input));
				outputNode.addAttribute("index", iO);
			}
		}
	}

	public load(node: XMLNode): void {
		let objectsNode     = node.findChild("objects");
		let wiresNode       = node.findChild("wires");

		let idMap = new Map<number, Component>();

		let objects = objectsNode.getChildren();
		for (let object of objects) {
			let xid = object.getIntAttribute("xid");

			// Create and add object
			let obj = CreateComponentFromXML(object.getTag());
			this.addObject(obj);

			// Add to ID map for connections later
			idMap.set(xid, obj);

			// Load properties
			obj.load(object);
		}

		let wires = wiresNode.getChildren();
		for (let wire of wires) {
			let inputNode  = wire.findChild("input");
			let outputNode = wire.findChild("output");

			// Load connections
			let inputObj  = idMap.get( inputNode.getIntAttribute("xid"));
			let outputObj = idMap.get(outputNode.getIntAttribute("xid"));
			let inputIndex  =  inputNode.getIntAttribute("index");
			let outputIndex = outputNode.getIntAttribute("index");

			// Create wire
			let w = this.connect(inputObj, inputIndex,  outputObj, outputIndex);

			// Load properties
			w.load(wire);
		}
	}

	public getObjects(): Array<Component> {
		return this.objects.slice(); // Shallow copy array
	}

	public getWires(): Array<Wire> {
		return this.wires.slice(); // Shallow copy array
	}

	public getXMLName(): string {
		return "circuit";
	}

}
