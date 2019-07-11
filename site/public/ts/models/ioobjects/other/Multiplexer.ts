import {ClampedValue} from "../../../utils/ClampedValue";

import {InputPort} from "../../ports/InputPort";
import {MuxPositioner} from "../../ports/positioners/MuxPositioners";

import {Mux} from "./Mux";

export class Multiplexer extends Mux {

    public constructor() {
        super(new ClampedValue(4, 2, Math.pow(2,8)), new ClampedValue(1),
              new MuxPositioner<InputPort>());
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
    }

    public getDisplayName(): string {
        return "Multiplexer";
    }

    public getXMLName(): string {
        return "mux";
    }

}
