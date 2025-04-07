import {AssemblerParams} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalSim}           from "digital/api/circuit/internal/sim/DigitalSim";
import {V} from "Vector";
import {LatchAssembler} from "./LatchAssembler";


export class OneInputLatchAssembler extends LatchAssembler {
    public constructor(params: AssemblerParams, sim: DigitalSim, kind: string, inputPortName: string) {
        super(params, sim, {
            kind,
            otherInputs: {
                [inputPortName]: () => ({
                    origin: V(-this.size.x/2, -this.size.y/4),
                    target: V(-this.size.x/2 - this.options.defaultPortLength, -this.size.y/4),
                }),
            },
        });
    }

   protected override getEnablePortYValue = () => this.size.y/4;
}
