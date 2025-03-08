import {V} from "Vector";

import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalComponentInfo} from "../../DigitalComponents";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";


export class ConstantHighAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    protected info: DigitalComponentInfo;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, V(1, 1), {
            "outputs": () => ({
                // Constant Low/High/Number have no border so we need to offset the output start point to match
                origin: V(.5 - this.options.defaultBorderWidth, 0),
                target: V(1.2, 0),
            }),
        }, [
            {
                kind: "SVG",

                dependencies: new Set([AssemblyReason.TransformChanged]),
                assemble:     (comp) => ({ kind: "SVG", svg: "constHigh.svg", transform: this.getTransform(comp) }),
                getTint:      (comp) => (this.isSelected(comp.id) ? this.options.selectedFillColor : undefined),
            },
        ]);
        this.sim = sim;
        this.info = this.circuit.getComponentInfo("ConstantHigh").unwrap() as DigitalComponentInfo;
    }
}
