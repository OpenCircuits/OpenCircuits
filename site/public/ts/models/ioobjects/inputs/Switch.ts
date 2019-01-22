import {V} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";
import {PressableComponent} from "../PressableComponent";

export class Switch extends PressableComponent {

	public constructor() {
		super(new ClampedValue(0),
			  new ClampedValue(1),
			  V(48, 60),
		  	  V(62, 77));
	}

	public click(): void {
		this.activate(!this.on);
	}

	public activate(signal: boolean): void {
		super.activate(signal, 0);
	}

    public getDisplayName(): string {
        return "Switch";
    }

	public getImageName(): string {
		return "switchUp.svg";
	}

	public getOnImageName(): string {
		return "switchDown.svg";
	}

    public getXMLName(): string {
        return "switch";
    }
}
