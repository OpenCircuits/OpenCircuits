import {serializable} from "serialeazy";

import {DEFAULT_SIZE} from "core/utils/Constants";

import {ClampedValue} from "math/ClampedValue";

import {ConstantSpacePositioner} from "core/models/ports/positioners/ConstantSpacePositioner";

import {InputPort} from "../../ports/InputPort";
import {Mux} from "./Mux";

@serializable("Multiplexer")
export class Multiplexer extends Mux {

    public constructor() {
        super(new ClampedValue(4, 2, Math.pow(2,8)), new ClampedValue(1),
              new ConstantSpacePositioner<InputPort>("left", DEFAULT_SIZE));
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
        // update the output port to align with the right edge of the Mux
        this.outputs.updatePortPositions();
    }

    public getDisplayName(): string {
        return "Multiplexer";
    }
}
