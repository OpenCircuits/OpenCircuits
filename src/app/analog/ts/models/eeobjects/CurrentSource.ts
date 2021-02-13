import {serializable} from "serialeazy";

import {IO_PORT_LENGTH} from "core/utils/Constants";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent} from "analog/models/AnalogComponent";

@serializable("CurrentSource")
export class CurrentSource extends AnalogComponent {
    public constructor(current: number = .005) {
        super(new ClampedValue(2), V(50));

        // Ensure no negative/zero current!!!
        if (current > 0) {
            this.current = current;
        } else {
            this.current = .005;
        }

        this.ports.getPorts()[0].setTargetPos(V(0, IO_PORT_LENGTH));
        this.ports.getPorts()[1].setTargetPos(V(0, -IO_PORT_LENGTH));
    }

    public getDisplayName(): string {
        return "CurrentSource";
    }

    public getImageName(): string {
        return "currentsource.svg";
    }
}
