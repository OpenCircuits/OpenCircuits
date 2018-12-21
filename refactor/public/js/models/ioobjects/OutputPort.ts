import {IO_PORT_LENGTH} from "../../utils/Constants";
import {Vector,V} from "../../utils/math/Vector";

import {Component} from "./Component";
import {Wire}      from "./Wire";

export class OutputPort {
	private parent: Component;
    private connections: Array<Wire>;
    private isOn: boolean;

	private origin: Vector;
	private target: Vector;

	constructor(parent: Component) {
		this.parent = parent;
		this.connections = [];
		this.isOn = false;

		this.origin = V(0, 0);
		this.target = V(IO_PORT_LENGTH, 0);
	}

	/**
	 * Active this port and propagate the signal
	 * 	to all active connections
	 *
	 * @param  {boolean} signal 	The signal to send
	 */
	public activate(signal: boolean): void {
		// Don't do anything if signal is same as current state
		if (signal == this.isOn)
			return;
		this.isOn = signal;

		// Get designer to propagate signal, exit if undefined
		var designer = this.parent.getDesigner();
		if (designer == undefined)
			return;

		for (var w of this.connections)
			designer.propogate(w, this.isOn);
	}

	public connect(w: Wire): void {
		this.connections.push(w);
		w.activate(this.isOn);
	}

	public getParent(): Component {
		return this.parent;
	}

	public getOrigin(): Vector {
		return this.origin;
	}
	public getTarget(): Vector {
		return this.target;
	}

	public getIsOn(): boolean {
		return this.isOn;
	}

	public getConnections(): Array<Wire> {
		return this.connections.slice(); // Shallow copy array
	}

}
