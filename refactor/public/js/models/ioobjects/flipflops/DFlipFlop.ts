import {V} from "../../../utils/math/Vector";
import {FlipFlop} from "./FlipFlop";

export class DFlipFlop extends FlipFlop {

	constructor() {
		super(2, 2, V(60, 60));
	}

	// @Override
	public activate() {
		this.last_clock = this.clock;
		this.clock = this.inputs[0].getIsOn();
		var data = this.inputs[1].getIsOn();
		if (this.clock && !this.last_clock)
			this.state = data;

		super.activate(this.state, 1);
		super.activate(!this.state, 0);
	}

	public getDisplayName() {
		return "D Flip Flop";
	}

	public getImageName() {
		return "flipflop.svg";
	}
}
