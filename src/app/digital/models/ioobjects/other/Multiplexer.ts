import {serializable} from "serialeazy";

import {ClampedValue} from "math/ClampedValue";

import {Mux} from "./Mux";
import {MultiplexerInputPositioner, MuxSelectPositioner} from "digital/models/ports/positioners/MuxPositioners";

@serializable("Multiplexer")
export class Multiplexer extends Mux {

    public constructor() {
        super(new ClampedValue(4, 2, Math.pow(2,8)), new ClampedValue(1),
              new MuxSelectPositioner(true), new MultiplexerInputPositioner());
        this.updatePortNames();
    }

    /**
     * Sets default names for the select and input ports so the user can easily
     * tell what they are used for.
     */
     private updatePortNames(): void {
        this.selects.getPorts().forEach((p, i) => {
            if (p.getName() == "") p.setName('S'+i)});
        this.inputs.getPorts().forEach((p, i) => {
            if (p.getName() == "") p.setName('I'+i)});
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
        this.updatePortNames();
    }

    public getDisplayName(): string {
        return "Multiplexer";
    }
}
