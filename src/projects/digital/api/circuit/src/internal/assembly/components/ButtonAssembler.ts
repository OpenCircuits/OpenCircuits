import {V, Vector} from "Vector";

import {Schema} from "shared/api/circuit/schema";

import {Signal} from "digital/api/circuit/schema/Signal";
import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalComponentConfigurationInfo} from "../../DigitalComponents";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";


export class ButtonAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    protected info: DigitalComponentConfigurationInfo;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, {
            "outputs": () => ({ origin: V(0.5, 0), dir: V(1, 0) })
        }, [
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.SelectionChanged]),
                assemble: (comp) => ({
                    kind:      "Rectangle",
                    transform: this.getTransform(comp),
                }),

                getStyle: (comp) => this.options.fillStyle(this.isSelected(comp.id)),
            },
            {
                kind: "SVG",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.StateUpdated]),
                assemble: (comp) => ({
                    kind:      "SVG",
                    svg:       this.isOn(comp) ? "buttonDown.svg" : "buttonUp.svg",
                    transform: this.getTransform(comp),
                }),
                tintChangesWhenSelected: true,
                getTint: (comp) => (this.isSelected(comp.id) ? this.options.selectedFillColor : undefined),
            },
        ]);
        this.sim = sim;
        this.info = this.circuit.getComponentInfo("Button").unwrap() as DigitalComponentConfigurationInfo;
    }

    protected override getSize(_: Schema.Component): Vector {
        return V(1, 1);
    }

    private isOn(sw: Schema.Component) {
        const [outputPort] = this.circuit.getPortsForComponent(sw.id).unwrap();
        return Signal.isOn(this.sim.getSignal(outputPort));
    }
}
