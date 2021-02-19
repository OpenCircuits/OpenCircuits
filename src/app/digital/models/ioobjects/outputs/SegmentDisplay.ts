import {serializable, serialize} from "serialeazy";

import {SegmentType, Segments} from "./Segments";

import {IO_PORT_RADIUS} from "core/utils/Constants";

import {Vector, V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {Name} from "core/utils/Name";

import {DigitalComponent} from "digital/models/DigitalComponent";
import {ConstantSpacePositioner} from "core/models/ports/positioners/ConstantSpacePositioner";


@serializable("SegmentDisplay")
export class SegmentDisplay extends DigitalComponent {
    @serialize
    protected segmentCount: number;

    public constructor(numInputs?: ClampedValue) {
        super(numInputs || new ClampedValue(7, 7, 16),
              new ClampedValue(0),
              V(70, 100),
              new ConstantSpacePositioner("left", 4*IO_PORT_RADIUS+2, false));

        this.segmentCount = 7;
        this.setInputPortCount(7);
    }

    protected setSegmentCount(val: number): void {
        this.segmentCount = val;

        // We do not want to reset the user typed name so we check
        //  if it was set in the first place
        if (!this.name.isSet())
            this.name = new Name(this.getDisplayName());
    }

    public setInputPortCount(val: number): void {
        super.setInputPortCount(val);
        this.setSegmentCount(val);
    }

    public isSegmentOn(segment: number): boolean {
        return this.getInputPort(segment).getIsOn();
    }

    public getSegments(): [Vector, SegmentType][] {
        const segments = Segments[`${this.segmentCount}`];

        // Turns the array into an array of Vectors and SegmentTypes
        return segments.map((value: [number[], SegmentType]) =>
            [V(value[0][0], value[0][1]), value[1]]
        );
    }

    public getSegmentCount(): number {
        return this.segmentCount;
    }

    public getDisplayName(): string {
        return `${this.segmentCount} Segment Display`;
    }
}
