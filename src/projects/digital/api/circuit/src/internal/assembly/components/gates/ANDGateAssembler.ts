import {AssemblerParams} from "shared/api/circuit/internal/assembly/Assembler";
import {GateAssembler} from "./GateAssemblers";
import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {V} from "Vector";
import {PositioningHelpers} from "shared/api/circuit/internal/assembly/PortAssembler";


export class ANDGateAssembler extends GateAssembler {
    public constructor(params: AssemblerParams, sim: DigitalSim, not: boolean) {
        super(params, sim, {
            size: V(1, 1),
            svg:  "and.svg",
            not,

            portFactory: {
                "inputs": (comp, index, total) => ({
                    // TODO[] -- figure out how to avoid the borderWidth
                    origin: V(
                        -0.5 + this.options.defaultBorderWidth/2,
                        -PositioningHelpers.ConstantSpacing(index, total, this.getSize(comp).y + this.options.defaultBorderWidth, { spacing: 0.5 })),
                    dir: V(-1, 0),
                }),
                "outputs": () => ({ origin: V(0.5, 0), dir: V(1, 0) }),
            },
            drawPortLineForGroups: ["inputs"],
        });
    }
}
