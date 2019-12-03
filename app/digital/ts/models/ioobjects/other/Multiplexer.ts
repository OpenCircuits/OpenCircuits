import {ClampedValue} from "math/ClampedValue";

import {InputPort} from "../../ports/InputPort";
import {MuxPositioner,
        MuxSinglePortPositioner} from "../../ports/positioners/MuxPositioners";

import {Mux} from "./Mux";
import {serializable} from "serialeazy";

@serializable("Multiplexer")
export class Multiplexer extends Mux {

    public constructor() {
        super(new ClampedValue(4, 2, Math.pow(2,8)), new ClampedValue(1),
              new MuxPositioner<InputPort>(), new MuxSinglePortPositioner());
    }

    /**
     * Activate function that allows the multiplexer
     * 	to give desired output
     */
    public activate(): void {
        let num = 0;
        for (let i = 0; i < this.selects.length; i++)
            num = num | ((this.selects.get(i).getIsOn() ? 1 : 0) << i);
        super.activate(this.inputs.get(num).getIsOn());
    }

    public setSelectPortCount(val: number): void {
        super.setSelectPortCount(val);
        super.setInputPortCount(Math.pow(2, val));
        // update the output port to align with the right edge of the Mux
        this.outputs.updatePortPositions();
    }

    public getDisplayName(): string {
        return "Multiplexer";
    }
}
