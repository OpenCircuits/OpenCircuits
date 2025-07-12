import {V, Vector} from "Vector";

import {Schema} from "shared/api/circuit/schema";

import {Signal} from "digital/api/circuit/schema/Signal";
import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {ComponentAssembler} from "shared/api/circuit/internal/assembly/ComponentAssembler";


export class ClockAssembler extends ComponentAssembler {
    protected readonly sim: DigitalSim;

    public constructor(params: AssemblerParams, sim: DigitalSim) {
        super(params, {
            "outputs": () => ({ origin: V(0.5, 0), dir: V(1, 0) }),
        }, [
            {
                kind: "SVG",

                // TODO: Add dependency handling for state change (may or may not be part of PropChanged)
                dependencies: new Set([AssemblyReason.TransformChanged, AssemblyReason.StateUpdated]),
                assemble:     (comp) => ({
                    kind:      "SVG",
                    svg:       this.isOn(comp) ? "clockOn.svg" : "clock.svg",
                    transform: this.getTransform(comp),
                }),

                tintChangesWhenSelected: true,
                getTint:                 (comp) => (this.isSelected(comp.id) ? this.options.selectedFillColor : undefined),
            },
        ]);
        this.sim = sim;
    }

    protected override getSize(_: Schema.Component): Vector {
        return V(1.2, 0.84);
    }

    private isOn(sw: Schema.Component) {
        const state = this.sim.getState(sw.id);
        if (!state || state.length === 0)
            return false;
        return Signal.toBool(Signal.invert(state[2]));
    }
}
