import {V} from "Vector";

import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalComponentConfigurationInfo} from "../../../DigitalComponents";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {PortFactory} from "shared/api/circuit/internal/assembly/PortAssembler";


export interface LatchAssemblerParams {
    kind: string;
    otherInputs: PortFactory;
}
export abstract class LatchAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    protected info: DigitalComponentConfigurationInfo;

    public constructor(params: AssemblerParams, sim: DigitalSim, { kind, otherInputs }: LatchAssemblerParams) {
        super(params, V(1.2, 1.2), {
            "Q":    () => ({ origin: V(this.size.x/2, this.size.y/4), target: V(this.size.x/2 + this.options.defaultPortLength, this.size.y/4) }),
            "Qinv": () => ({ origin: V(this.size.x/2, -this.size.y/4), target: V(this.size.x/2 + this.options.defaultPortLength, -this.size.y/4) }),
            "E":    () => ({ origin: V(-this.size.x/2, this.getEnablePortYValue()), target: V(-this.size.x/2 - this.options.defaultPortLength, this.getEnablePortYValue()) }),
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

    protected abstract getEnablePortYValue(): number;
}
