import {V} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";
import {Component} from "../Component";

export class LED extends Component {

	constructor() {
		super(new ClampedValue(1),
			  new ClampedValue(0),
			  V(60, 60));
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
