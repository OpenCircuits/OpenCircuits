import {V, Vector} from "Vector";

import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalComponentConfigurationInfo} from "../../DigitalComponents";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {Schema} from "shared/api/circuit/schema";


export class ComparatorAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    protected info: DigitalComponentConfigurationInfo;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, {
            "inputsA": (comp, index, total) => ({
                origin: V(-this.getSize(comp).x/2, (index - total) / 2),
                dir:    V(-1, 0),
            }),
            "inputsB": (comp, index) => ({
                origin: V(-this.getSize(comp).x/2, (1 + index) / 2),
                dir:    V(-1, 0),
            }),
            "lt": (comp) => ({
                origin: V(this.getSize(comp).x/2, -.5),
                dir:    V(1, 0),
            }),
            "eq": (comp) => ({
                origin: V(this.getSize(comp).x/2, 0),
                dir:    V(1, 0),
            }),
            "gt": (comp) => ({
                origin: V(this.getSize(comp).x/2, .5),
                dir:    V(1, 0),
            }),
        }, [
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged]),
                assemble:     (comp) => ({
                    kind:      "Rectangle",
                    transform: this.getTransform(comp),
                }),

                styleChangesWhenSelected: true,
                getStyle:                 (comp) => this.options.fillStyle(this.isSelected(comp.id)),
            },
        ]);
        this.sim = sim;
        this.info = this.circuit.getComponentInfo("Comparator").unwrap() as DigitalComponentConfigurationInfo;
    }

    protected override getSize(comp: Schema.Component): Vector {
        const numInputPorts = this.getInputPortCount(comp);
        return V(1.25, numInputPorts + 0.5);
    }

    protected getInputPortCount(comp: Schema.Component) {
        return this.circuit.getPortsByGroup(comp.id).unwrap()["inputsA"]?.length ?? 2;
    }
}
