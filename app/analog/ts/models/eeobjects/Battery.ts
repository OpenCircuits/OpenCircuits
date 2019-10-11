import {V}     from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent} from "../AnalogComponent";

export class Battery extends AnalogComponent {

    public constructor(voltage: number = 5) {
        super(new ClampedValue(2), V(50, 50));

        // Ensure no negative/zero voltage!!!
        if (voltage > 0) {
            this.voltage = voltage;
        } else {
            this.voltage = 5;
        }

        this.inputs[0].setOriginPos(V(this.inputs[0].getOriginPos().y, -this.inputs[0].getOriginPos().x));
        this.inputs[0].setTargetPos(V(this.inputs[0].getTargetPos().y, -this.inputs[0].getTargetPos().x));

        this.outputs[0].setOriginPos(V(this.outputs[0].getOriginPos().y, -this.outputs[0].getOriginPos().x));
        this.outputs[0].setTargetPos(V(this.outputs[0].getTargetPos().y, -this.outputs[0].getTargetPos().x));
    }

    public getDisplayName(): string {
        return "Battery";
    }

	public getImageName() {
		return "voltagesource.svg";
	}

    public getXMLName(): string {
        return "battery";
    }

}
