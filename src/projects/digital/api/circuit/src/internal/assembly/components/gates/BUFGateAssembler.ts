import {DigitalSim}           from "digital/api/circuit/internal/sim/DigitalSim";
import {AssemblerParams} from "shared/api/circuit/internal/assembly/Assembler";
import {V} from "Vector";
import {GateAssembler} from "./GateAssemblers";


export class BUFGateAssembler extends GateAssembler {
    public constructor(
        params: AssemblerParams, sim: DigitalSim, not: boolean
    ) {
        super(params, sim, {
            size: V(1, 1),
            svg:  "buf.svg",
            not,

            portFactory: {
                "inputs":  () => ({ origin: V(-0.5, 0), dir: V(-1, 0) }),
                "outputs": () => ({
                    // Origin needs to be inset slightly since at 0.5 it's at the tip of the triangle
                    origin: V(0.5 - this.options.defaultBorderWidth, 0),
                    target: V(0.5 + this.options.defaultPortLength, 0),
                }),
            },
        });
    }
}
