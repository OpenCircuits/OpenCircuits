import {V} from "Vector";

import {CircuitInternal, GUID} from "shared/api/circuit/internal";

import {Assembler, AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {CircuitAssembler} from "shared/api/circuit/internal/assembly/CircuitAssembler";
import {NodeAssembler}    from "shared/api/circuit/internal/assembly/NodeAssembler";
import {RenderOptions}    from "shared/api/circuit/internal/assembly/RenderOptions";
import {ICComponentAssembler} from "shared/api/circuit/internal/assembly/ICComponentAssembler";

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
import {BCDDisplayAssembler} from "./components/displays/BCDDisplayAssembler";
import {ASCIIDisplayAssembler} from "./components/displays/ASCIIDisplayAssembler";
import {SegmentDisplayAssembler} from "./components/displays/SegmentDisplayAssembler";
import {BUFGateAssembler} from "./components/gates/BUFGateAssembler";
import {TwoInputFlipFlopAssembler} from "./components/flipflops/TwoInputFlipFlopAssembler";
import {OneInputFlipFlopAssembler} from "./components/flipflops/OneInputFlipFlopAssembler";
import {OneInputLatchAssembler} from "./components/latches/OneInputLatchAssembler";
import {TwoInputLatchAssembler} from "./components/latches/TwoInputLatchAssembler";
import {OscilloscopeAssembler} from "./components/OscilloscopeAssembler";
import {MultiplexerAssembler} from "./components/MultiplexerAssembler";
import {DemultiplexerAssembler} from "./components/DemultiplexerAssembler";
import {EncoderAssembler} from "./components/EncoderAssembler";
import {DecoderAssembler} from "./components/DecoderAssembler";
import {ComparatorAssembler} from "./components/ComparatorAssembler";


export class DigitalCircuitAssembler extends CircuitAssembler {
    public constructor(
        circuit: CircuitInternal,
        options: RenderOptions,
        sim: DigitalSim,
        assemblers: (params: AssemblerParams) => Record<string, Assembler>,
    ) {
        super(circuit, options, assemblers);

        sim.subscribe((ev) => {
            if (ev.type === "queue") {
                const comps = ev.comps, inputPorts = ev.updatedInputPorts;
                comps.forEach((compId) =>
                    this.dirtyComponents.add(compId, AssemblyReason.StateUpdated));
                inputPorts.forEach((portId) => {
                    const port = circuit.getPortByID(portId).unwrap();
                    this.dirtyComponents.add(port.parent, AssemblyReason.SignalsChanged);
                });
            }
            if (ev.type === "step") {
                const inputPorts = ev.updatedInputPorts, outputPorts = ev.updatedOutputPorts;

                outputPorts.forEach((portId) => {
                    const wires = circuit.getWiresForPort(portId).unwrap();
                    wires.forEach((wireId) =>
                        this.dirtyWires.add(wireId, AssemblyReason.SignalsChanged));
                });
                inputPorts.forEach((portId) => {
                    const port = circuit.getPortByID(portId).unwrap();
                    this.dirtyComponents.add(port.parent, AssemblyReason.SignalsChanged);
                });
            }

            this.publish({ type: "onchange" });
        })
    }

    protected override createIC(icId: GUID): Assembler {
        return new ICComponentAssembler(
            { circuit: this.circuit, cache: this.cache, options: this.options },
            icId,
        );
    }
}


export function MakeDigitalCircuitAssembler(
    circuit: CircuitInternal,
    sim: DigitalSim,
    options: RenderOptions,
): CircuitAssembler {
    return new DigitalCircuitAssembler(circuit, options, sim, (params) => ({
        // Base types
        "DigitalWire": new DigitalWireAssembler(params, sim),
        "DigitalNode": new NodeAssembler(params, {
            // TODO[.](leon): transform the direction so that the angle of the node changes `dir`
            "outputs": () => ({ origin: V(0, 0), target: V(0, 0), dir: V(-1, 0) }),
            "inputs":  () => ({ origin: V(0, 0), target: V(0, 0), dir: V(+1, 0) }),
        }),
        // Inputs
        "Switch":         new SwitchAssembler(params, sim),
        "Button":         new ButtonAssembler(params, sim),
        "Clock":          new ClockAssembler(params, sim),
        "ConstantHigh":   new ConstantHighAssembler(params, sim),
        "ConstantLow":    new ConstantLowAssembler(params, sim),
        "ConstantNumber": new ConstantNumberAssembler(params, sim),

        // Outputs
        "LED":            new LEDAssembler(params, sim),
        "SegmentDisplay": new SegmentDisplayAssembler(params, sim),
        "BCDDisplay":     new BCDDisplayAssembler(params, sim),
        "ASCIIDisplay":   new ASCIIDisplayAssembler(params, sim),
        "Oscilloscope":   new OscilloscopeAssembler(params, sim),

        // Gates
        "BUFGate":  new BUFGateAssembler(params, sim, false),
        "NOTGate":  new BUFGateAssembler(params, sim, true),
        "ANDGate":  new ANDGateAssembler(params, sim, false),
        "NANDGate": new ANDGateAssembler(params, sim, true),
        "ORGate":   new ORGateAssembler(params, sim, { xor: false, not: false }),
        "NORGate":  new ORGateAssembler(params, sim, { xor: false, not: true  }),
        "XORGate":  new ORGateAssembler(params, sim, { xor: true,  not: false }),
        "XNORGate": new ORGateAssembler(params, sim, { xor: true,  not: true  }),

        // FlipFlops
        "SRFlipFlop": new TwoInputFlipFlopAssembler(params, sim, "SRFlipFlop", "S", "R"),
        "JKFlipFlop": new TwoInputFlipFlopAssembler(params, sim, "JKFlipFlop", "J", "K"),
        "DFlipFlop":  new OneInputFlipFlopAssembler(params, sim, "DFlipFlop", "D"),
        "TFlipFlop":  new OneInputFlipFlopAssembler(params, sim, "TFlipFlop", "T"),

        // Latches
        "DLatch":  new OneInputLatchAssembler(params, sim, "DLatch", "D"),
        "SRLatch": new TwoInputLatchAssembler(params, sim, "SRLatch", "S", "R"),

        // Other
        "Multiplexer":   new MultiplexerAssembler(params, sim),
        "Demultiplexer": new DemultiplexerAssembler(params, sim),

        "Encoder": new EncoderAssembler(params, sim),
        "Decoder": new DecoderAssembler(params, sim),

        "Comparator": new ComparatorAssembler(params, sim),
    }));
}
