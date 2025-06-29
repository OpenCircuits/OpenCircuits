import {V, Vector} from "Vector";

import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {Schema} from "shared/api/circuit/schema";
import {PositioningHelpers} from "shared/api/circuit/internal/assembly/PortAssembler";


export class EncoderAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    public constructor(params: AssemblerParams, sim: DigitalSim, kind: "Encoder" | "Decoder") {
        super(params, {
            "inputs": (comp, index, total) => ({
                origin: V(-0.5, -PositioningHelpers.ConstantSpacing(index, total, this.getSize(comp).y, { spacing: 0.5 })),
                dir:    V(-1, 0),
            }),
            "outputs": (comp, index, total) => ({
                origin: V(0.5, -PositioningHelpers.ConstantSpacing(index, total, this.getSize(comp).y, { spacing: 0.5 })),
                dir:    V(1, 0),
            }),
        }, [
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.PortsChanged]),
                assemble:     (comp) => ({
                    kind:      "Rectangle",
                    transform: this.getTransform(comp),
                }),

                styleChangesWhenSelected: true,
                getStyle: (comp) => this.options.fillStyle(this.isSelected(comp.id)),
            },
        ], { sizeChangesWhenPortsChange: true });
        this.sim = sim;
    }

    protected override getSize(comp: Schema.Component): Vector {
        const numPorts = this.getPortCount(comp);
        return V((1 + (numPorts - 1)/20), Math.pow(2, numPorts)/2);
    }

    protected getPortCount(comp: Schema.Component) {
        const group = (comp.kind === "Encoder" ? "outputs" : "inputs");
        return this.circuit.getPortsByGroup(comp.id).unwrap()[group]?.length ?? 2;
    }
}
