import {Vector, V} from "../../../utils/math/Vector";
import {CircleContains} from "../../../utils/math/MathUtils";
import {ClampedValue} from "../../../utils/ClampedValue";
import {PressableComponent} from "../PressableComponent";

export class Button extends PressableComponent {
	public constructor() {
		super(new ClampedValue(0),
			  new ClampedValue(1),
			  V(50, 50),
		  	  V(50, 50));
	}

	public isWithinPressBounds(v: Vector): boolean {
		return CircleContains(this.getTransform().getPos(), this.getTransform().getSize().x/2, v);
	}

    public press() {
        this.activate(true);
    }

    public release() {
        this.activate(false);
    }

	public activate(signal: boolean): void {
		super.activate(signal, 0);
	}

    public getDisplayName(): string {
        return "Button";
    }

	public getImageName(): string {
		return "buttonUp.svg";
	}

	public getOnImageName(): string {
		return "buttonDown.svg";
	}

    public getXMLName(): string {
        return "button";
    }
}
