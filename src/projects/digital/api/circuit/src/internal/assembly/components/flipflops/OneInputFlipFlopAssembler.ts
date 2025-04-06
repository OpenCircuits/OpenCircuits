import {AssemblerParams} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalSim}           from "digital/api/circuit/internal/sim/DigitalSim";
import {V} from "Vector";
import {FlipFlopAssembler} from "./FlipFlopAssembler";


export class OneInputFlipFlopAssembler extends FlipFlopAssembler {
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

   protected override getClkPortYValue = () => this.size.y/4;
}
