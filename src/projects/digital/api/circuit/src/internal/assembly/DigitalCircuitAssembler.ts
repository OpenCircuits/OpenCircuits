import {V} from "Vector";

import {CircuitInternal} from "shared/api/circuit/internal";

import {CircuitAssembler} from "shared/api/circuit/internal/assembly/CircuitAssembler";
import {NodeAssembler}    from "shared/api/circuit/internal/assembly/NodeAssembler";
import {RenderOptions}    from "shared/api/circuit/internal/assembly/RenderOptions";

import {DigitalSim}           from "../sim/DigitalSim";
import {DigitalWireAssembler} from "./DigitalWireAssembler";
import {ANDGateAssembler}     from "./components/gates/ANDGateAssembler";
import {ORGateAssembler}      from "./components/gates/ORGateAssembler";
import {LEDAssembler}         from "./components/LEDAssembler";
import {SwitchAssembler}      from "./components/SwitchAssembler";
import {ButtonAssembler}      from "./components/ButtonAssembler";
import {ClockAssembler}       from "./components/ClockAssembler";
import {ConstantHighAssembler} from "./components/ConstantHighAssembler";
import {ConstantLowAssembler} from "./components/ConstantLowAssembler";
import {ConstantNumberAssembler} from "./components/ConstantNumberAssembler";


export function MakeDigitalCircuitAssembler(
    circuit: CircuitInternal,
    sim: DigitalSim,
    options: RenderOptions,
): CircuitAssembler {
    return new CircuitAssembler(circuit, options, (params) => ({
        // Base types
        "DigitalWire": new DigitalWireAssembler(params, sim),
        "DigitalNode": new NodeAssembler(params, {
            // TODO[.](leon): transform the direction so that the angle of the node changes `dir`
            "outputs": () => ({ origin: V(0, 0), target: V(0, 0), dir: V(-1, 0) }),
            "inputs":  () => ({ origin: V(0, 0), target: V(0, 0), dir: V(+1, 0) }),
        }),
        // // Inputs
        "Switch": new SwitchAssembler(params, sim),
        "Button": new ButtonAssembler(params, sim),
        "Clock": new ClockAssembler(params, sim),
        "ConstantHigh": new ConstantHighAssembler(params, sim),
        "ConstantLow": new ConstantLowAssembler(params, sim),
        "ConstantNumber": new ConstantNumberAssembler(params, sim),

        // // Outputs
        "LED": new LEDAssembler(params, sim),

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
    }));
}
