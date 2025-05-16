import {V, Vector} from "Vector";

import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalComponentConfigurationInfo} from "../../DigitalComponents";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {Schema} from "shared/api/circuit/schema";


export class ConstantHighAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    protected info: DigitalComponentConfigurationInfo;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, {
            "outputs": () => ({
                // Constant Low/High/Number have no border so we need to offset the output start point to match
                origin: V(0.5 - this.options.defaultBorderWidth, 0),
                target: V(0.5 + this.options.defaultPortLength, 0),
            }),
        }, [
            {
                kind: "SVG",

                tintChangesWhenSelected: true,

                dependencies: new Set([AssemblyReason.TransformChanged]),
                assemble:     (comp) => ({ kind: "SVG", svg: "constHigh.svg", transform: this.getTransform(comp) }),
                getTint:      (comp) => (this.isSelected(comp.id) ? this.options.selectedFillColor : undefined),
            },
        ]);
        this.sim = sim;
        this.info = this.circuit.getComponentInfo("ConstantHigh").unwrap() as DigitalComponentConfigurationInfo;
    }

    protected override getSize(_: Schema.Component): Vector {
        return V(1, 1);
    }
}
