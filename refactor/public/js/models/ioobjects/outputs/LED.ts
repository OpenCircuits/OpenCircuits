import {DEFAULT_SIZE} from "../../../utils/Constants";

import {V} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";
import {Component} from "../Component";

export class LED extends Component {

	constructor() {
		super(new ClampedValue(1),
			  new ClampedValue(0),
			  V(60, 60));

		// Make port face down instead of sideways
		this.inputs[0].setTargetPos(V(0, 2*DEFAULT_SIZE));
	}

	public isOn(): boolean {
		return this.inputs[0].getIsOn();
	}

    public getDisplayName(): string {
        return "LED";
    }

	public getImageName(): string {
		return "led.svg";
	}
}
