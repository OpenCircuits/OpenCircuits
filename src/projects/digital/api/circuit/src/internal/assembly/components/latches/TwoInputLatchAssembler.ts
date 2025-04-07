import {AssemblerParams} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalSim}           from "digital/api/circuit/internal/sim/DigitalSim";
import {V} from "Vector";
import {LatchAssembler} from "./LatchAssembler";


export class TwoInputLatchAssembler extends LatchAssembler {
    public constructor(params: AssemblerParams, sim: DigitalSim, kind: string, inputPort1Name: string, inputPort2Name: string) {
        super(params, sim, {
            kind,
            otherInputs: {
                [inputPort1Name]: () => ({
                    origin: V(-this.size.x/2, -3*this.size.y/8),
                    target: V(-this.size.x/2 - this.options.defaultPortLength, -3*this.size.y/8),
                }),
                [inputPort2Name]: () => ({
                    origin: V(-this.size.x/2, 3*this.size.y/8),
                    target: V(-this.size.x/2 - this.options.defaultPortLength, 3*this.size.y/8),
                }),
            },
        });
    }

   protected override getEnablePortYValue = () => 0;
}
