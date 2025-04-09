import {V, Vector} from "Vector";

import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalComponentConfigurationInfo} from "../../DigitalComponents";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {Schema} from "shared/api/circuit/schema";


export class EncoderAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    protected info: DigitalComponentConfigurationInfo;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, {
            "inputs": (comp, index, total) => {
                const x = -this.getSize(comp).x/2
                const y = -(index - ((total - 1) / 2)) / 2
                return {
                    origin: V(x, y),
                    target: V(x - this.options.defaultPortLength, y),
                }
            },
            "outputs": (comp, index, total) => {
                const x = this.getSize(comp).x/2
                const y = -(index - ((total - 1) / 2)) / 2
                return {
                    origin: V(x, y),
                    target: V(x + this.options.defaultPortLength, y),
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
        this.info = this.circuit.getComponentInfo("Encoder").unwrap() as DigitalComponentConfigurationInfo;
    }

    protected override getSize(comp: Schema.Component): Vector {
        const numOutputPorts = this.getOutputPortCount(comp);
        return V((1 + (numOutputPorts - 1)/20), Math.pow(2, numOutputPorts)/2);
    }

    protected getOutputPortCount(comp: Schema.Component) {
        return this.circuit.getPortsByGroup(comp.id).unwrap()["outputs"]?.length ?? 2;
    }
}
