import {Latch} from "./Latch";

export class SRLatch extends Latch {

	public constructor() {
		super(3);
	}

	// @Override
	public activate() {
		this.clock = this.inputs[1].getIsOn();
		this.set = this.inputs[0].getIsOn();
		const reset = this.inputs[2].getIsOn();
		if (this.clock) {
			if (this.set && reset) {
				// undefined behavior
			} else if (this.set)
				this.state = true;
			else if (reset)
				this.state = false;
		}

		super.activate(this.state, 1);
		super.activate(!this.state, 0);
	}

	public getDisplayName(): string {
		return "SR Latch";
	}

	public getXMLName(): string {
		return "srl";
	}
}
