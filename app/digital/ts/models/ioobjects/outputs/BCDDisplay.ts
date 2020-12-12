import {serializable} from "serialeazy";

import Segments from "./Segments.json"
import BCDFont from "./BCDFont.json";

import {Vector, V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {Name} from "core/utils/Name";

import {BCDDisplayPositioner} from "digital/models/ports/positioners/BCDDisplayPositioner";
import {DigitalComponent} from "digital/models/DigitalComponent";

export type SegmentType = "vertical" | "horizontal" | "diagonaltr" | "diagonaltl" | "diagonalbr" | "diagonalbl" | "horizontal0.5";

@serializable("BCDDisplay")
export class BCDDisplay extends DigitalComponent{

    public constructor(){
        super(new ClampedValue(6, 6, 6),
              new ClampedValue(0),
              V(70, 100),
              new BCDDisplayPositioner());

        this.setInputPortCount(6);
    }

    public setInputPortCount(val: number): void {
        super.setInputPortCount(val);
        // We do not want to reset the user typed name so we check
        //  if it was set in the first place
        if (!this.name.isSet())
            this.name = new Name(this.getDisplayName());
    }

    //access the index of the BCDFont based on the decimal number 
    public getBCDFont(val: number): Array<number>{
        const BCDNum = BCDFont[this.getInputPortCount().getValue() + ""][val];
        return BCDNum;
    }
    public getSegments(): Array<[Vector, SegmentType]> {
        //hardcoding "7", the only segment configuration needed
        const segments = Segments["7"];
        // Turns the array into an array of Vectors and SegmentTypes
        return segments.map((value: [number[], SegmentType]) =>
            [V(value[0][0], value[0][1]), value[1]]
        );
    }

    public getDisplayName(): string {
        if (this.inputs == undefined)
            return "BCD Display"
        return this.getInputPorts().length + " BCD Display";
    }
}
