import {V} from "Vector";

import {EEComponent} from "./EEComponent";
import {EEPort}	     from "./EEPort";
import {EEWire}      from "./EEWire";

export class InputPort extends EEPort {
	private input?: EEWire;

	public constructor(parent: EEComponent) {
		super(parent, V(-1, 0));
		this.input = undefined;
	}

	public disconnect(): void {
		// remove input
		this.input = undefined;
	}

	public setInput(input: EEWire): void {
		this.input = input;
	}

	public getInput(): EEWire {
		return this.input;
	}

}
