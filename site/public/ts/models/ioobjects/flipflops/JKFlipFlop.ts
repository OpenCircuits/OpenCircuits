import {FlipFlop} from "./FlipFlop";

export class JKFlipFlop extends FlipFlop {

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
				this.state = !this.state;
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
		return "JK Flip Flop";
	}

    public getXMLName(): string {
        return "jkff";
    }
}
