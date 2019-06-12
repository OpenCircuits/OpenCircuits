import {V} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";
import {Gate} from "./Gate";

export class BUFGate extends Gate {

	constructor(not: boolean = false) {
		super(not, new ClampedValue(1,1,1), V(50, 50));
	}

	// @Override
	public activate() {
		super.activate(this.inputs.first.getIsOn());
	}

	public getDisplayName() {
		return this.not ? "NOT Gate" : "Buffer Gate";
	}

	public getImageName() {
		return "buf.svg";
	}

    public getXMLName(): string {
        return "buf";
    }
}
