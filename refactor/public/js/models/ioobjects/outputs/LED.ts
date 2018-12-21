import {V} from "../../../utils/math/Vector";
import {Component} from "../Component";

export class LED extends Component {

	constructor() {
		super(1, 0, false, V(60, 60));
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
