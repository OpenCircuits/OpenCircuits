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
            "inputsA": (comp, index, total) => {
                const { x } = this.getSize(comp);
                const y = (index - total) / 2;
                return {
                    origin: V(-x/2, y),
                    target: V(-x/2 - this.options.defaultPortLength, y),
                }
            },
            "inputsB": (comp, index) => {
                const { x } = this.getSize(comp);
                const y = (1 + index) / 2;
                return {
                    origin: V(-x/2, y),
                    target: V(-x/2 - this.options.defaultPortLength, y),
                }
            },
            "lt": (comp) => {
                const { x } = this.getSize(comp);
                return {
                    origin: V(x/2, -.5),
                    target: V(x/2 + this.options.defaultPortLength, -.5),
                }
            },
            "eq": (comp) => {
                const { x } = this.getSize(comp);
                return {
                    origin: V(x/2, 0),
                    target: V(x/2 + this.options.defaultPortLength, 0),
                }
            },
            "gt": (comp) => {
                const { x } = this.getSize(comp);
                return {
                    origin: V(x/2, .5),
                    target: V(x/2 + this.options.defaultPortLength, .5),
                }
            },
        }, [
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged]),
                assemble:     (comp) => ({
                    kind:      "Rectangle",
                    transform: this.getTransform(comp),
                }),

                styleChangesWhenSelected: true,
                getStyle: (comp) => this.options.fillStyle(this.isSelected(comp.id)),
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
