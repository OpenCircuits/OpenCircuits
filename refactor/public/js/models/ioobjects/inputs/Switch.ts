import {V} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";
import {Component} from "../Component";

export class Switch extends Component {

	constructor() {
		super(new ClampedValue(0),
			  new ClampedValue(1),
			  V(60, 60));
	}

    // @Override
	public activate(signal: boolean): void {
		super.activate(signal, 0);
	}

    public getDisplayName(): string {
        return "Switch";
    }

	public getImageName(): string {
		return "switchUp.svg";
	}
}
