import {Vector, V} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";

import {SSDPositioner} from "../../ports/positioners/SSDPositioner";

import {Component} from "../Component";

export class SevenSegmentDisplay extends Component {
    public constructor() {
        super(new ClampedValue(7),
              new ClampedValue(0),
              V(70, 100),
              new SSDPositioner());

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

    public getXMLName() {
        return "sevensegmentdisplay";
    }
}
