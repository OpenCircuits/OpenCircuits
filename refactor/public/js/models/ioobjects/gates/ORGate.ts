import {V} from "../../../utils/math/Vector";
import {Gate} from "./Gate";

export class ORGate extends Gate {

	constructor(not: boolean = false) {
		super(not, 2, V(60, 60));
	}

	// @Override
	public activate() {
		var on = false;
		for (var i = 0; i < this.inputs.length; i++)
			on = (on || this.inputs[i].getIsOn());
		super.activate(on);
	}

	public getDisplayName() {
		return this.not ? "NOR Gate" : "OR Gate";
	}

	public getImageName() {
		return "or.svg";
	}
}
