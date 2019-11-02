import {IO_PORT_RADIUS} from "core/utils/Constants";

import {Vector, V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {ConstantSpacePositioner} from "core/models/ports/positioners/ConstantSpacePositioner";

import {InputPort} from "../../ports/InputPort";

import {DigitalComponent} from "digital/models/DigitalComponent";

export type SegmentType = "vertical" | "horizontal" | "diagonal" | "horizontal0.5";

export class SegmentDisplay extends DigitalComponent {
    public constructor() {
        super(new ClampedValue(7),
              new ClampedValue(0),
              V(70, 100),
              new ConstantSpacePositioner<InputPort>(2*IO_PORT_RADIUS+1));

        this.setInputPortCount(7);
    }

    public getSegments(): Array<[Vector, SegmentType]> {
        return [[V( 0,   -1), "horizontal"],
                [V( 0.5, -0.5), "vertical"],
                [V( 0.5,  0.5), "vertical"],
                [V( 0,    1), "horizontal"],
                [V(-0.5,  0.5), "vertical"],
                [V(-0.5, -0.5), "vertical"],
                [V( 0,    0), "horizontal"]];
    }

    public getDisplayName(): string {
        return "7 Segment Display";
    }

    public getXMLName(): string {
        return "sevensegmentdisplay";
    }
}
