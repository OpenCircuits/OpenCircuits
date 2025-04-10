import {V, Vector} from "Vector";

import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalComponentConfigurationInfo} from "../../../DigitalComponents";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {PortFactory} from "shared/api/circuit/internal/assembly/PortAssembler";
import {Schema} from "shared/api/circuit/schema";


export interface LatchAssemblerParams {
    kind: string;
    otherInputs: PortFactory;
}
export abstract class LatchAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    protected info: DigitalComponentConfigurationInfo;

    public constructor(params: AssemblerParams, sim: DigitalSim, { kind, otherInputs }: LatchAssemblerParams) {
        super(params, {
            "Q":    (comp) => ({ origin: V(this.getSize(comp).x/2, this.getSize(comp).y/4), dir: V(1, 0) }),
            "Qinv": (comp) => ({ origin: V(this.getSize(comp).x/2, -this.getSize(comp).y/4), dir: V(1, 0) }),
            "E":    (comp) => ({ origin: V(-this.getSize(comp).x/2, this.getEnablePortYValue(comp)), dir: V(-1, 0) }),
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
        this.info = this.circuit.getComponentInfo(kind).unwrap() as DigitalComponentConfigurationInfo;
    }

    protected override getSize(_: Schema.Component): Vector {
        return V(1.2, 1.2);
    }

    protected abstract getEnablePortYValue(comp: Schema.Component): number;
}
