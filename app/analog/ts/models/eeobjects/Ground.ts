import {serializable} from "serialeazy";

import {IO_PORT_RADIUS} from "core/utils/Constants";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent} from "analog/models/AnalogComponent";

@serializable("Ground")
export class Ground extends AnalogComponent {

    public constructor(capacitance: number = 5) {
        
        super(new ClampedValue(1), V(50, 50));

        this.ports.getPorts()[0].setOriginPos(V(0, 0));
        this.ports.getPorts()[0].setTargetPos(V(0, -this.getSize().y/2 - IO_PORT_RADIUS));
    }

    public getDisplayName(): string {
        return "Ground";
    }

    public getImageName(): string {
        return "ground.svg";
    }
}
