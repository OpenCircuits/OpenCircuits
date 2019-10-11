import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent} from "../AnalogComponent";

export class Resistor extends AnalogComponent {

    public constructor(resistance: number = 5) {
        super(new ClampedValue(2), V(50, 30));

        this.resistance = resistance;
        // this.inputs[0].setOriginPos(this.getSize().scale(this.inputs[0].getDir()).scale(0.5));
        // this.outputs[0].setOriginPos(this.getSize().scale(this.outputs[0].getDir()).scale(0.5));
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
