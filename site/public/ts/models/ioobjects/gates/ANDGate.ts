import {V} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";

import {ANDGatePositioner} from "../../ports/positioners/ANDGatePositioner";

import {Gate} from "./Gate";

export class ANDGate extends Gate {

	public constructor(not: boolean = false) {
		super(not, new ClampedValue(2,2,8), V(50, 50), new ANDGatePositioner());
	}

	// @Override
	public activate() {
		const on = this.getInputPorts().every((input) => input.getIsOn());
		super.activate(on);
	}

	public getDisplayName(): string {
		return this.not ? "NAND Gate" : "AND Gate";
	}

	public getImageName(): string {
		return "and.svg";
	}

    public getXMLName(): string {
        return "and";
    }
}
