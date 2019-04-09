import {DEFAULT_SIZE} from "../../../utils/Constants";

import {V} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";
import {Component} from "../Component";

export class LED extends Component {
	private color: string;

	constructor() {
		super(new ClampedValue(1),
			  new ClampedValue(0),
			  V(50, 50));
		this.color = "#ffffff";

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

	public getOnImageName() {
		return "ledLight.svg"
	}

	public getColor(): string {
		return this.color;
	}

	public setColor(color: string) {
		this.color = color;
	}

    public getXMLName(): string {
        return "led";
    }
}
