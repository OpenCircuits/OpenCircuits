import {FlipFlop} from "./FlipFlop";

export class SRFlipFlop extends FlipFlop {

	public constructor() {
		super(3);
	}

	// @Override
	public activate() {
		this.last_clock = this.clock;
		this.clock = this.inputs[1].getIsOn();
		var set = this.inputs[0].getIsOn();
		var reset = this.inputs[2].getIsOn();
		if (this.clock && !this.last_clock) {
			if (set && reset) {
				// undefined behavior
			} else if (set) {
				this.state = true;
			} else if (reset) {
				this.state = false;
			}
		}

		super.activate(this.state, 0);
		super.activate(!this.state, 1);
	}

	public getDisplayName() {
		return "SR Flip Flop";
	}

    public getXMLName(): string {
        return "srff";
    }
}
