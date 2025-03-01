import {V} from "Vector";

import {Schema} from "shared/api/circuit/schema";

import {Signal} from "digital/api/circuit/internal/sim/Signal";
import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalComponentInfo} from "../../DigitalComponents";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";


export class ButtonAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    protected info: DigitalComponentInfo;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, V(1, 1), {
            "outputs": () => ({origin: V(0.5, 0), dir: V(1, 0)})
        }, [
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.SelectionChanged]),
                assemble: (comp) => ({
                    kind: "Rectangle",
                    transform: this.getTransform(comp),
                }),

                getStyle: (comp) => this.options.fillStyle(this.isSelected(comp.id)),
            },
            {
                kind: "SVG",

                // TODO: Add dependency handling for state change (may or may not be part of PropChanged)
                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.PropChanged]),
                assemble: (comp) => ({kind: "SVG", svg: this.isOn(comp) ? "buttonDown.svg" : "buttonUp.svg", transform: this.getTransform(comp)}),
                getTint: (comp) => (this.isSelected(comp.id) ? this.options.selectedFillColor : undefined)
            },
        ]);
        this.sim = sim;
        this.info = this.circuit.doc.getObjectInfo("Button").unwrap() as DigitalComponentInfo;
    }

    private isOn(sw: Schema.Component) {
        const [outputPort] = this.circuit.doc.getPortsForComponent(sw.id).unwrap();
        return Signal.isOn(this.sim.getSignal(outputPort));
    }

}
