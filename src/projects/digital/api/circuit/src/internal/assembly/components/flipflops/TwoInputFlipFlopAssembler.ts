import {AssemblerParams} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalSim}           from "digital/api/circuit/internal/sim/DigitalSim";
import {V} from "Vector";
import {FlipFlopAssembler} from "./FlipFlopAssembler";


export class TwoInputFlipFlopAssembler extends FlipFlopAssembler {
    public constructor(params: AssemblerParams, sim: DigitalSim, kind: string, inputPort1Name: string, inputPort2Name: string) {
        super(params, sim, {
            kind,
            otherInputs: {
                [inputPort1Name]: (comp) => ({
                    origin: V(-this.getSize(comp).x/2, -3*this.getSize(comp).y/8),
                    target: V(-this.getSize(comp).x/2 - this.options.defaultPortLength, -3*this.getSize(comp).y/8),
                }),
                [inputPort2Name]: (comp) => ({
                    origin: V(-this.getSize(comp).x/2, 3*this.getSize(comp).y/8),
                    target: V(-this.getSize(comp).x/2 - this.options.defaultPortLength, 3*this.getSize(comp).y/8),
                }),
            },
        });
    }

   protected override getClkPortYValue = () => 0;
}
