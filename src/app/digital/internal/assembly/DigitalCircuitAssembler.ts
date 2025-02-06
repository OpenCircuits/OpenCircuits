import {Obj} from "core/schema/Obj";

import {CircuitInternal}   from "core/internal";
import {SelectionsManager} from "core/internal/impl/SelectionsManager";

import {Assembler,
        AssemblerParams}  from "core/internal/assembly/Assembler";
import {CircuitAssembler} from "core/internal/assembly/CircuitAssembler";
import {NodeAssembler}    from "core/internal/assembly/NodeAssembler";
import {WireAssembler}    from "core/internal/assembly/WireAssembler";
import {RenderOptions}    from "core/internal/assembly/RenderOptions";

import {DigitalSim}           from "../sim/DigitalSim";
import {ANDGateAssembler}     from "./components/ANDGateAssembler";
// import {XORGateAssembler}     from "./components/XORGateAssembler";
// import {ORGateAssembler}      from "./components/ORGateAssembler";
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
            "DigitalWire": new WireAssembler(params),
            "DigitalNode": new NodeAssembler(params),
            // // Inputs
            // "Switch": new SwitchAssembler(params, sim),

            // // Outputs
            // "LED": new LEDAssembler(params),

            // Gates
            "ANDGate": new ANDGateAssembler(params, sim),
            // "ORGate":  new ORGateAssembler(params),
            // "XORGate": new XORGateAssembler(params),

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
