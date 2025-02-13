import {Obj} from "core/schema/Obj";

import {CircuitInternal}   from "core/internal";
import {SelectionsManager} from "core/internal/impl/SelectionsManager";

import {Assembler,
        AssemblerParams}  from "core/internal/assembly/Assembler";
import {CircuitAssembler} from "core/internal/assembly/CircuitAssembler";
import {NodeAssembler}    from "core/internal/assembly/NodeAssembler";
import {RenderOptions}    from "core/internal/assembly/RenderOptions";

import {DigitalSim}           from "../sim/DigitalSim";
import {DigitalWireAssembler} from "./DigitalWireAssembler";
import {ANDGateAssembler}     from "./components/gates/ANDGateAssembler";
import {ORGateAssembler}      from "./components/gates/ORGateAssembler";
// import {LEDAssembler}         from "./components/LEDAssembler";
// import {SwitchAssembler}      from "./components/SwitchAssembler";


export class DigitalCircuitAssembler extends CircuitAssembler {
    protected sim: DigitalSim;
    protected assemblers: Record<string, Assembler>;

    public constructor(circuit: CircuitInternal, selections: SelectionsManager,
                       sim: DigitalSim, options: RenderOptions) {
        super(circuit, selections);

        this.sim = sim;

        const params: AssemblerParams = { circuit, cache: this.cache, selections, options };
        this.assemblers = {
            // Base types
            "DigitalWire": new DigitalWireAssembler(params, sim),
            "DigitalNode": new NodeAssembler(params),
            // // Inputs
            // "Switch": new SwitchAssembler(params, sim),

            // // Outputs
            // "LED": new LEDAssembler(params),

            // Gates
            "ANDGate":  new ANDGateAssembler(params, sim, false),
            "NANDGate": new ANDGateAssembler(params, sim, true),
            "ORGate":   new ORGateAssembler(params, sim, { xor: false, not: false }),
            "NORGate":  new ORGateAssembler(params, sim, { xor: false, not: true  }),
            "XORGate":  new ORGateAssembler(params, sim, { xor: true,  not: false }),
            "XNORGate": new ORGateAssembler(params, sim, { xor: true,  not: true  }),

            // FlipFlops

            // Latches

            // Other
        };
    }

    protected getAssemblerFor(kind: string): Assembler<Obj> {
        // TODO[model_refactor](leon) - Consider going back to templating `kind`, but as a post-effort once the view
        //                               is all set-in-stone.
        if (!(kind in this.assemblers))
            throw new Error(`Failed to get assembler for kind ${kind}! Unmapped!`);
        return this.assemblers[kind];
    }
}
