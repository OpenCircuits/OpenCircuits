import {IO_PORT_RADIUS} from "digital/utils/Constants";

import {Vector, V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {ConstantSpacePositioner} from "core/models/ports/positioners/ConstantSpacePositioner";

import {InputPort} from "../../ports/InputPort";

import {DigitalComponent} from "digital/models/DigitalComponent";

export class SevenSegmentDisplay extends DigitalComponent {
    public constructor() {
        super(new ClampedValue(7),
              new ClampedValue(0),
              V(70, 100),
              new ConstantSpacePositioner<InputPort>(2*IO_PORT_RADIUS+1));

        this.setInputPortCount(7);
    }

    public getSegments(): Array<Vector> {
        return [V( 0,   -1), V(1, 0),
                V( 1, -0.5), V(0, 1),
                V( 1,  0.5), V(0, 1),
                V( 0,    1), V(1, 0),
                V(-1,  0.5), V(0, 1),
                V(-1, -0.5), V(0, 1),
                V( 0,    0), V(1, 0)];
    }

    public getDisplayName(): string {
        return "7 Segment Display";
    }

    public getXMLName(): string {
        return "sevensegmentdisplay";
    }
}
