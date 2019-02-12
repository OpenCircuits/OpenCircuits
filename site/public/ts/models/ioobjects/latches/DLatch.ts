import {Latch} from "./Latch";

export class DLatch extends Latch {

	public constructor() {
		super(2);
	}

	// @Override
	public activate() {
		this.clock = this.inputs[0].getIsOn();
		this.set = this.inputs[1].getIsOn();
		if (this.clock)
        	this.state = this.set;

		super.activate(this.state, 1);
		super.activate(!this.state, 0);
	}

	public getDisplayName(): string {
		return "D Latch";
	}

    public getXMLName(): string {
        return "dl";
    }
}
