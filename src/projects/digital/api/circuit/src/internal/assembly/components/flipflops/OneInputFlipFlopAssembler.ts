import {AssemblerParams} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalSim}           from "digital/api/circuit/internal/sim/DigitalSim";
import {V} from "Vector";
import {FlipFlopAssembler} from "./FlipFlopAssembler";


export class OneInputFlipFlopAssembler extends FlipFlopAssembler {
    public constructor(params: AssemblerParams, sim: DigitalSim, inputPortName: string) {
        super(params, sim, {
            otherInputs: {
                [inputPortName]: () => ({ origin: V(-0.5, 1/6), dir: V(-1, 0) }),
            },
            clkPortYValue: -1/6,
        });
    }
}
