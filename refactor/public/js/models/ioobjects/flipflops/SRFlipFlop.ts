import {V} from "../../../utils/math/Vector";
import {FlipFlop} from "./FlipFlop";

export class SRFlipFlop extends FlipFlop {

	constructor() {
		super(3, 2, V(60, 60));
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

	public getImageName() {
		return "flipflop.svg";
	}
}
