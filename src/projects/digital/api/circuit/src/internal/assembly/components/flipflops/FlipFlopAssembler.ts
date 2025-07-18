import {V, Vector} from "Vector";

import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {PortFactory} from "shared/api/circuit/internal/assembly/PortAssembler";
import {Schema} from "shared/api/circuit/schema";


export interface FlipFlopAssemblerParams {
    kind: string;
    otherInputs: PortFactory;
    clkPortYValue: number;
}
export abstract class FlipFlopAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    public constructor(params: AssemblerParams, sim: DigitalSim, { otherInputs, clkPortYValue }: FlipFlopAssemblerParams) {
        super(params, {
            "pre":  () => ({ origin: V(0,    0.5),  dir: V(0,  1) }),
            "clr":  () => ({ origin: V(0,   -0.5),  dir: V(0, -1) }),
            "Q":    () => ({ origin: V(0.5,  1/6), dir: V(1,  0) }),
            "Qinv": () => ({ origin: V(0.5, -1/6), dir: V(1,  0) }),
            "clk":  () => ({ origin: V(-0.5, clkPortYValue), dir: V(-1, 0) }),
            ...otherInputs,
        }, [
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.SelectionChanged]),
                assemble:     (comp) => ({
                    kind:      "Rectangle",
                    transform: this.getTransform(comp),
                }),

                styleChangesWhenSelected: true,

                getStyle: (comp) => this.options.fillStyle(this.isSelected(comp.id)),
            },
        ]);
        this.sim = sim;
    }

    protected override getSize(_: Schema.Component): Vector {
        return V(1.5, 1.5);
    }
}
