import {V, Vector} from "Vector";

import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {PortFactory} from "shared/api/circuit/internal/assembly/PortAssembler";
import {Schema} from "shared/api/circuit/schema";


export interface LatchAssemblerParams {
    kind: string;
    otherInputs: PortFactory;
    enablePortYValue: number;
}
export abstract class LatchAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    public constructor(params: AssemblerParams, sim: DigitalSim, { kind, otherInputs, enablePortYValue }: LatchAssemblerParams) {
        super(params, {
            "Q":    () => ({ origin: V(0.5,  1/6), dir: V(1, 0) }),
            "Qinv": () => ({ origin: V(0.5, -1/6), dir: V(1, 0) }),
            "E":    () => ({ origin: V(-0.5, enablePortYValue), dir: V(-1, 0) }),
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
