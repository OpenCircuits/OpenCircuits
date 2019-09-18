import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {EEComponent} from "./EEComponent";

export class Resistor extends EEComponent {

    public constructor(resistance: number = 5) { //make sure resistance is > 0
        super(new ClampedValue(1), new ClampedValue(1), V(50, 30));

        this.resistance = resistance;
        this.inputs[0].setOriginPos(this.getSize().scale(this.inputs[0].getDir()).scale(0.5));
        this.outputs[0].setOriginPos(this.getSize().scale(this.outputs[0].getDir()).scale(0.5));
    }

    public getDisplayName(): string {
        return "Resistor";
    }

	public getImageName() {
		return "resistor.svg";
	}

    public getXMLName(): string {
        return "resistor";
    }

}
