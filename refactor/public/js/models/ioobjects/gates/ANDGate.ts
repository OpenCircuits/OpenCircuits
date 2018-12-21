import {V} from "../../../utils/math/Vector";
import {Gate} from "./Gate";

export class ANDGate extends Gate {

	constructor(not: boolean = false) {
		super(not, 2, V(60, 60));
	}

	// @Override
	public activate() {
		var on = true;
		for (var i = 0; i < this.inputs.length; i++)
			on = (on && this.inputs[i].getIsOn());
		super.activate(on);
	}

	public getDisplayName(): string {
		return this.not ? "NAND Gate" : "AND Gate";
	}

	public getImageName(): string {
		return "and.svg";
	}
}
