import {AssemblerParams} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalSim}           from "digital/api/circuit/internal/sim/DigitalSim";
import {V} from "Vector";
import {LatchAssembler} from "./LatchAssembler";
import {Schema} from "shared/api/circuit/schema";


export class OneInputLatchAssembler extends LatchAssembler {
    public constructor(params: AssemblerParams, sim: DigitalSim, kind: string, inputPortName: string) {
        super(params, sim, {
            kind,
            otherInputs: {
                [inputPortName]: (comp) => ({
                    origin: V(-this.getSize(comp).x/2, -this.getSize(comp).y/4),
                    target: V(-this.getSize(comp).x/2 - this.options.defaultPortLength, -this.getSize(comp).y/4),
                }),
            },
        });
    }

   protected override getEnablePortYValue = (comp: Schema.Component) => this.getSize(comp).y/4;
}
