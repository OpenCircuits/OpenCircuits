import {V, Vector} from "Vector";

import {Schema} from "shared/api/circuit/schema";

import {Signal} from "digital/api/circuit/schema/Signal";
import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";
import {Transform} from "math/Transform";


export class SwitchAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, {
            "outputs": () => ({ origin: V(0.5, 0), dir: V(1, 0) }),
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
            {
                kind: "SVG",

                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.StateUpdated]),
                assemble:     (comp) => ({
                    kind:      "SVG",
                    svg:       this.isOn(comp) ? "switchDown.svg" : "switchUp.svg",
                    transform: this.getTransform(comp).withScale(V(0.96, 1.2)),
                }),
                tintChangesWhenSelected: true,
                getTint:                 (comp) => (this.isSelected(comp.id) ? this.options.selectedFillColor : undefined),
            },
        ]);
        this.sim = sim;
    }

    protected override getSize(_: Schema.Component): Vector {
        return V(1.24, 1.54);
    }

    private isOn(sw: Schema.Component) {
        const state = this.sim.getState(sw.id);
        if (!state || state.length === 0)
            return Signal.Off;
        return Signal.isOn(state[0]);
    }
}
