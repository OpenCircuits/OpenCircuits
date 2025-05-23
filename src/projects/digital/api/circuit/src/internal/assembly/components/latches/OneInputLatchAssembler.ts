import {V} from "Vector";

import {AssemblerParams} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalSim}      from "digital/api/circuit/internal/sim/DigitalSim";

import {LatchAssembler} from "./LatchAssembler";


export class OneInputLatchAssembler extends LatchAssembler {
    public constructor(params: AssemblerParams, sim: DigitalSim, inputPortName: string) {
        super(params, sim, {
            otherInputs: {
                [inputPortName]: () => ({ origin: V(-0.5, 1/6), dir: V(-1, 0) }),
            },
            enablePortYValue: -1/6,
        });
    }
}
