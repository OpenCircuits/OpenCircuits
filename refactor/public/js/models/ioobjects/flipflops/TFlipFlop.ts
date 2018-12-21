import {V} from "../../../utils/math/Vector";
import {FlipFlop} from "./FlipFlop";

export class TFlipFlop extends FlipFlop {

	constructor() {
		super(2, 2, V(60, 60));
	}

	// @Override
	public activate() {
		this.last_clock = this.clock;
		this.clock = this.inputs[0].getIsOn();
		var toggle = this.inputs[1].getIsOn();
		if (this.clock && !this.last_clock && toggle)
			this.state = !this.state;

		super.activate(this.state, 0);
		super.activate(!this.state, 1);
	}

	public getDisplayName() {
		return "T Flip Flop";
	}

	public getImageName() {
		return "flipflop.svg";
	}
}
