import {IO_PORT_LENGTH} from "../../utils/Constants";
import {Vector,V} from "../../utils/math/Vector";

import {Component} from "./Component";
import {Wire}      from "./Wire";

export class InputPort {
	private parent: Component;
	private input?: Wire;
	private isOn: boolean;

	private origin: Vector;
	private target: Vector;

	constructor(parent: Component) {
		this.parent = parent;
		this.input = undefined;
		this.isOn = false;

		this.origin = V(0, 0);
		this.target = V(-IO_PORT_LENGTH, 0);
	}

	public activate(signal: boolean) {
		// Don't do anything if signal is same as current state
		if (signal == this.isOn)
			return;
		this.isOn = signal;

		// Get designer to propagte signal, exit if undefined
		var designer = this.parent.getDesigner();
		if (designer == undefined)
			return;

		designer.propogate(this.parent, this.isOn);
	}

	public setInput(input: Wire): void {
		this.input = input;
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

	public getInput(): Wire {
		return this.input;
	}

}
