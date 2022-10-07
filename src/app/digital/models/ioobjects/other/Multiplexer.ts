import {serializable} from "serialeazy";

import {ClampedValue} from "math/ClampedValue";

import {MultiplexerInputPositioner, MuxSelectPositioner} from "digital/models/ports/positioners/MuxPositioners";

import {Mux} from "./Mux";


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
    protected override updatePortNames(): void {
        super.updatePortNames();
        this.inputs.getPorts().forEach((p, i) => {
            if (p.getName() === "")
                p.setName(`I${i}`);
        });
        this.outputs.getPorts()[0].setName("O0");
    }

    /**
     * Activate function that allows the multiplexer
     *  to give desired output.
     */
    public override activate(): void {
        let num = 0;
        for (let i = 0; i < this.selects.length; i++)
            num = num | ((this.selects.get(i).getIsOn() ? 1 : 0) << i);
        super.activate(this.inputs.get(num).getIsOn());
    }

    public getDisplayName(): string {
        return "Multiplexer";
    }
}
