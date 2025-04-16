import {AssemblerParams} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalSim}           from "digital/api/circuit/internal/sim/DigitalSim";
import {V} from "Vector";
import {FlipFlopAssembler} from "./FlipFlopAssembler";
import {Schema} from "shared/api/circuit/schema";


export class OneInputFlipFlopAssembler extends FlipFlopAssembler {
    public constructor(params: AssemblerParams, sim: DigitalSim, kind: string, inputPortName: string) {
        super(params, sim, {
            kind,
            otherInputs: {
                [inputPortName]: (comp) => ({
                    origin: V(-this.getSize(comp).x/2, this.getSize(comp).y/4),
                    dir:    V(-1, 0),
                }),
            },
        });
    }

   protected override getClkPortYValue = (comp: Schema.Component) => -this.getSize(comp).y/4;
}
