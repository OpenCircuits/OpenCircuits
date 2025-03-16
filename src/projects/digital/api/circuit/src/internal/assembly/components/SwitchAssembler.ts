import {V} from "Vector";

import {Schema} from "shared/api/circuit/schema";

import {Signal} from "digital/api/circuit/internal/sim/Signal";
import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {DigitalComponentConfigurationInfo} from "../../DigitalComponents";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {Transform} from "math/Transform";


export class SwitchAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    protected info: DigitalComponentConfigurationInfo;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, V(1.24, 1.54), {
            "outputs": () => ({origin: V(0.62, 0), dir: V(1, 0)})
        }, [
            {
                kind: "BaseShape",

                dependencies: new Set([AssemblyReason.TransformChanged]),
                assemble: (comp) => ({
                    kind: "Rectangle",
                    transform: this.getTransform(comp),
                }),

                styleChangesWhenSelected: true,
                getStyle: (comp) => this.options.fillStyle(this.isSelected(comp.id)),
            },
            {
                kind: "SVG",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.StateUpdated]),
                assemble: (comp) => ({kind: "SVG", svg: this.isOn(comp) ? "switchDown.svg" : "switchUp.svg", transform: new Transform(this.getPos(comp), V(0.96, 1.2), this.getAngle(comp))}),
                getTint: (comp) => (this.isSelected(comp.id) ? this.options.selectedFillColor : undefined),
                tintChangesWhenSelected: true,
            },
        ]);
        this.sim = sim;
        this.info = this.circuit.getComponentInfo("Switch").unwrap() as DigitalComponentConfigurationInfo;
    }

    private isOn(sw: Schema.Component) {
        const [outputPort] = this.circuit.getPortsForComponent(sw.id).unwrap();
        return Signal.isOn(this.sim.getSignal(outputPort));
    }
}
