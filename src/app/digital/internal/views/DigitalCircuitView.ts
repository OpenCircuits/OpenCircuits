import {CircuitInternal}      from "core/internal";
import {SelectionsManager}    from "core/internal/impl/SelectionsManager";
import {Assembler}            from "core/internal/view/Assembler";
import {CircuitView}          from "core/internal/view/CircuitView";
import {Obj}                  from "core/schema/Obj";
import {DigitalSim}           from "../sim/DigitalSim";
import {ANDGateAssembler}     from "./components/ANDGateAssembler";
import {LEDAssembler}         from "./components/LEDAssembler";
import {SwitchAssembler}      from "./components/SwitchAssembler";
import {DigitalWireAssembler} from "./DigitalWireAssembler";


export class DigitalCircuitView extends CircuitView {
    protected sim: DigitalSim;
    protected assemblers?: Record<string, Assembler>;

    public constructor(circuit: CircuitInternal, selections: SelectionsManager, sim: DigitalSim) {
        super(circuit, selections);
        this.sim = sim;
    }

    protected getAssemblerFor(kind: string): Assembler<Obj> {
        // Create assemblers on first call since some assemblers load images and so we need to defer it
        if (!this.assemblers) {
            this.assemblers = {
                // Base types
                "DigitalWire": new DigitalWireAssembler(this.circuit, this, this.selections, this.sim),

                // Inputs
                "Switch": new SwitchAssembler(this.circuit, this, this.selections, this.sim),

                // Outputs
                "LED": new LEDAssembler(this.circuit, this, this.selections, this.sim),

                // Gates
                "ANDGate": new ANDGateAssembler(this.circuit, this, this.selections, this.sim),

                // FlipFlops

                // Latches

                // Other
            };
        }

        // TODO[model_refactor](leon) - Consider going back to templating `kind`, but as a post-effort once the view
        //                               is all set-in-stone.
        if (!(kind in this.assemblers))
            throw new Error(`Failed to get assembler for kind ${kind}! Unmapped!`);
        return this.assemblers[kind];
    }
}