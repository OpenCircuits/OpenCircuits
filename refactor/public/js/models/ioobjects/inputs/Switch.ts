import {V} from "../../../utils/math/Vector";
import {Component} from "../Component";

export class Switch extends Component {

	constructor() {
		super(0, 1, true, V(60, 60));
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
