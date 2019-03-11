import {CreateComponentFromXML} from "../utils/ComponentFactory";

import {XMLable} from "../utils/io/xml/XMLable";
import {XMLNode} from "../utils/io/xml/XMLNode";

import {CreateWire,
		SaveGroup,
		LoadGroup} from "../utils/ComponentUtils";

import {Propagation} from "./Propagation";

import {IOObject}  from "./ioobjects/IOObject";
import {Component} from "./ioobjects/Component";
import {Wire}      from "./ioobjects/Wire";
import {ICData}  from "./ioobjects/other/ICData";
import {IC}  from "./ioobjects/other/IC";

import {InputPort}  from "./ioobjects/InputPort";
import {OutputPort} from "./ioobjects/OutputPort";

export class CircuitDesigner implements XMLable {
	private ics: Array<ICData>;

	private objects: Array<Component>;
	private wires: Array<Wire>;
	private propagationQueue: Array<Propagation>;
	private updateRequests: number;
	private propagationTime: number;

	private updateCallback: () => void;

	public constructor(propagationTime: number = 1, callback: () => void = function(){}) {
		this.propagationTime = propagationTime;
		this.updateCallback = callback;

		this.reset();
	}

	public reset(): void {
		this.ics     = [];
		this.objects = [];
		this.wires   = [];
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
	public propagate(receiver: IOObject, signal: boolean): void {
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

	public addICData(data: ICData): void {
		this.ics.push(data);
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

	public createWire(p1: OutputPort, p2: InputPort): Wire {
		let wire = CreateWire(p1, p2);
		this.wires.push(wire);
		wire.setDesigner(this);
		return wire;
	}

	public connect(c1: Component, i1: number, c2: Component, i2: number): Wire {
		return this.createWire(c1.getOutputPort(i1), c2.getInputPort(i2));
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
		let icDataNode  = node.createChild("icdata");

		let icIdMap = new Map<ICData, number>();
		let icId = 0;

		// Create ICData map
		for (let ic of this.ics)
			icIdMap.set(ic, icId++);

		// Save ICs
		for (let ic of this.ics) {
			let icNode = icDataNode.createChild("icdata");
			let icid = icIdMap.get(ic);

			icNode.addAttribute("icid", icid);
			ic.save(icNode, icIdMap);
		}

		SaveGroup(node, this.objects, this.wires, icIdMap);
	}


	public load(node: XMLNode): void {
		let icDataNode  = node.findChild("icdata");

		let icIdMap = new Map<number, ICData>();
		let ics = icDataNode.getChildren();

		// Create ICData map
		for (let ic of ics) {
			let icid = ic.getIntAttribute("icid");
			icIdMap.set(icid, new ICData())
		}

		// Load ICs
		for (let ic of ics) {
			let icid = ic.getIntAttribute("icid");
			icIdMap.get(icid).load(ic, icIdMap);
		}

		let group = LoadGroup(node, icIdMap);

		// Add all objects/wires
		group.getAllComponents().forEach((c) => this.addObject(c));
		group.wires.forEach((w) => {
			this.wires.push(w);
			w.setDesigner(this);
		});
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
