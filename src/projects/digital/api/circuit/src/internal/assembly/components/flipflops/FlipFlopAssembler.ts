import {V} from "Vector";

import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalComponentConfigurationInfo} from "../../../DigitalComponents";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {PortFactory} from "shared/api/circuit/internal/assembly/PortAssembler";


export interface FlipFlopAssemblerParams {
    kind: string;
    otherInputs: PortFactory;
}
export abstract class FlipFlopAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    protected info: DigitalComponentConfigurationInfo;

    public constructor(params: AssemblerParams, sim: DigitalSim, { kind, otherInputs }: FlipFlopAssemblerParams) {
        super(params, V(2, 2.4), {
            "pre":  () => ({ origin: V(0, this.size.y/2), target: V(0, this.size.y/2 + this.options.defaultPortLength) }),
            "clr":  () => ({ origin: V(0, -this.size.y/2), target: V(0, -this.size.y/2 - this.options.defaultPortLength) }),
            "Q":    () => ({ origin: V(this.size.x/2, this.size.y/4), target: V(this.size.x/2 + this.options.defaultPortLength, this.size.y/4) }),
            "Qinv": () => ({ origin: V(this.size.x/2, -this.size.y/4), target: V(this.size.x/2 + this.options.defaultPortLength, -this.size.y/4) }),
            "clk":  () => ({ origin: V(-this.size.x/2, this.getClkPortYValue()), target: V(-this.size.x/2 - this.options.defaultPortLength, this.getClkPortYValue()) }),
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

    protected abstract getClkPortYValue(): number;
}
