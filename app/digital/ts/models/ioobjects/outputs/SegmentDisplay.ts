import {serializable} from "serialeazy";

import Segments from "./Segments.json";

import {IO_PORT_RADIUS} from "core/utils/Constants";

import {Vector, V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {Name} from "core/utils/Name";

import {DigitalComponent} from "digital/models/DigitalComponent";
import {ConstantSpacePositioner} from "core/models/ports/positioners/ConstantSpacePositioner";

export type SegmentType = "vertical" | "horizontal" | "diagonaltr" | "diagonaltl" | "diagonalbr" | "diagonalbl" | "horizontal0.5";

@serializable("SegmentDisplay")
export class SegmentDisplay extends DigitalComponent {
    public constructor() {
        super(new ClampedValue(7, 7, 16),
              new ClampedValue(0),
              V(70, 100),
              new ConstantSpacePositioner("left", 4*IO_PORT_RADIUS+2, false));

        this.setInputPortCount(7);
    }

    public setInputPortCount(val: number): void {
        super.setInputPortCount(val);
        // We do not want to reset the user typed name so we check
        //  if it was set in the first place
        if (!this.name.isSet())
            this.name = new Name(this.getDisplayName());
    }

    public getSegments(): Array<[Vector, SegmentType]> {
        const segments = Segments[this.getInputPorts().length + ""];

        // Turns the array into an array of Vectors and SegmentTypes
        return segments.map((value: [number[], SegmentType]) =>
            [V(value[0][0], value[0][1]), value[1]]
        );
    }

    public getDisplayName(): string {
        if (this.inputs == undefined)
            return "Segment Display"
        return this.getInputPorts().length + " Segment Display";
    }
}
