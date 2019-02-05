/*
    //This is a part of the old code that I wasn't able to implement
    //So the click area of the button is a rectangle

    contains(pos) {
        return circleContains(this.transform, pos);
    }
}
*/

import {V} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";
import {PressableComponent} from "../PressableComponent";

export class Button extends PressableComponent {
	public constructor() {
		super(new ClampedValue(0),
			  new ClampedValue(1),
			  V(50, 50),
		  	  V(50, 50));
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
