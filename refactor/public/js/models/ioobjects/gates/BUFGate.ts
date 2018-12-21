import {V} from "../../../utils/math/Vector";
import {Gate} from "./Gate";

export class BUFGate extends Gate {

	constructor(not: boolean = false) {
		super(not, 1, V(60, 60));
	}

	// @Override
	public activate() {
		var on = false;
		for (var i = 0; i < this.inputs.length; i++)
			on = this.inputs[i].getIsOn();
		super.activate(on);
	}

	public getDisplayName() {
		return this.not ? "NOT Gate" : "Buffer Gate";
	}

	public getImageName() {
		return "buf.svg";
	}
}
