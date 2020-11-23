import {serializable} from "serialeazy";

import Segments from "./Segments.json";

import {Vector, V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {Name} from "core/utils/Name";

import {BCDDisplayPositioner} from "digital/models/ports/positioners/BCDDisplayPositioner";
import { DigitalComponent } from "digital/models/DigitalComponent";

export type SegmentType = "vertical" | "horizontal" | "diagonaltr" | "diagonaltl" | "diagonalbr" | "diagonalbl" | "horizontal0.5";

@serializable("BCDDisplay")
export class BCDDisplay extends DigitalComponent{

    public constructor(){
        super(new ClampedValue(7, 7, 16),
              new ClampedValue(0),
              V(70, 100),
              new BCDDisplayPositioner());

        this.setInputPortCount(7);
    }

    public setInputPortCount(val: number): void {
        super.setInputPortCount(val);
        // We do not want to reset the user typed name so we check
        //  if it was set in the first place
        if (!this.name.isSet())
            this.name = new Name(this.getDisplayName());
    }

    //public getBinaryNum(): number {}
    //Insert code for getting the binary number based on the inputs.

    public getDisplayName(): string {
        if (this.inputs == undefined)
            return "BCD Display"
        return this.getInputPorts().length + " BCD Display";
}
