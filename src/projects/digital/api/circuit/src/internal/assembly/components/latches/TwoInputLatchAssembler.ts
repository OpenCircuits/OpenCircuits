import {AssemblerParams} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalSim}           from "digital/api/circuit/internal/sim/DigitalSim";
import {V} from "Vector";
import {LatchAssembler} from "./LatchAssembler";


export class TwoInputLatchAssembler extends LatchAssembler {
    public constructor(params: AssemblerParams, sim: DigitalSim, inputPort1Name: string, inputPort2Name: string) {
        super(params, sim, {
            otherInputs: {
                [inputPort1Name]: () => ({ origin: V(-0.5,  1/3), dir: V(-1, 0) }),
                [inputPort2Name]: () => ({ origin: V(-0.5, -1/3), dir: V(-1, 0) }),
            },
            enablePortYValue: 0,
        });
    }
}
