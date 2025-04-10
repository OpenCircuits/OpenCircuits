import {DigitalSim}           from "digital/api/circuit/internal/sim/DigitalSim";
import {AssemblerParams} from "shared/api/circuit/internal/assembly/Assembler";
import {V} from "Vector";
import {GateAssembler} from "./GateAssemblers";


export class BUFGateAssembler extends GateAssembler {
    public constructor(
        params: AssemblerParams, sim: DigitalSim, not: boolean
    ) {
        super(params, sim, {
            kind:        not ? "NOTGate" : "BUFGate",
            size:        V(1, 1),
            svg:         "buf.svg",
            not,
            portFactory: {
                "outputs": () => ({ origin: V(0.4, 0), target: V(1.2, 0) }),
                "inputs":  (_, index, total) => {
                    const spacing = 0.5 - this.options.defaultBorderWidth/2;
                    return { origin: V(-0.5, spacing*((total-1)/2 - index)), dir: V(-1, 0) };
                },
            },
            otherPrims: [],
        });
    }
}
