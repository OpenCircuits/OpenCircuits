import {serializable} from "serialeazy";

import {IO_PORT_LENGTH} from "core/utils/Constants";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent} from "analog/models/AnalogComponent";

@serializable("Battery")
export class Battery extends AnalogComponent {
    public constructor(voltage: number = 5) {
        super(new ClampedValue(2), V(50, 50));

        // Ensure no negative/zero voltage!!!
        if (voltage > 0) {
            this.voltage = voltage;
        } else {
            this.voltage = 5;
        }

        this.ports.getPorts()[0].setTargetPos(V(0, IO_PORT_LENGTH));
        this.ports.getPorts()[1].setTargetPos(V(0, -IO_PORT_LENGTH));
    }

    public getDisplayName(): string {
        return "Battery";
    }

    public getImageName(): string {
        return "voltagesource.svg";
    }
}
