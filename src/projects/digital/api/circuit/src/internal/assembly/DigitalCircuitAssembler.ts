import {V} from "Vector";

import {CircuitInternal} from "shared/api/circuit/internal";

import {Assembler, AssemblerParams, AssemblyReason} from "shared/api/circuit/internal/assembly/Assembler";
import {CircuitAssembler} from "shared/api/circuit/internal/assembly/CircuitAssembler";
import {NodeAssembler}    from "shared/api/circuit/internal/assembly/NodeAssembler";
import {RenderOptions}    from "shared/api/circuit/internal/assembly/RenderOptions";
import {ICComponentAssembler} from "shared/api/circuit/internal/assembly/ICComponentAssembler";

import {ContextPath, DigitalSim}           from "../sim/DigitalSim";
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
import {SegmentDisplayAssembler} from "./components/displays/SegmentDisplayAssembler";
import {BUFGateAssembler} from "./components/gates/BUFGateAssembler";
import {TwoInputFlipFlopAssembler} from "./components/flipflops/TwoInputFlipFlopAssembler";
import {OneInputFlipFlopAssembler} from "./components/flipflops/OneInputFlipFlopAssembler";
import {OneInputLatchAssembler} from "./components/latches/OneInputLatchAssembler";
import {TwoInputLatchAssembler} from "./components/latches/TwoInputLatchAssembler";
import {OscilloscopeAssembler} from "./components/OscilloscopeAssembler";
import {MultiplexerAssembler} from "./components/MultiplexerAssembler";
import {EncoderAssembler} from "./components/EncoderAssembler";
import {ComparatorAssembler} from "./components/ComparatorAssembler";
import {LabelAssembler} from "./components/LabelAssembler";
import {BaseDisplayAssembler} from "./components/displays/BaseDisplayAssembler";
import {ASCIIFont, BCDFont} from "./components/displays/SegmentDisplayConstants";
import {DigitalKinds} from "../DigitalComponents";


export class DigitalCircuitAssembler extends CircuitAssembler {
    public constructor(
        circuit: CircuitInternal,
        options: RenderOptions,
        sim: DigitalSim,
        assemblers: (params: AssemblerParams) => Record<number, Assembler>,
    ) {
        super(circuit, options, assemblers);

        sim.subscribe((ev) => {
            const [comps, inputPorts, outputPorts] =
                ((ev.type === "queue")
                ? [ev.comps, ev.updatedInputPorts, new Set<ContextPath>()]
                : [ev.updatedCompStates, ev.updatedInputPorts, ev.updatedOutputPorts])
                // Only find root IDs (path length = 1)
                .map((paths) =>
                    [...paths].filter((p) => p.length === 1).map((p) => p[0]));

            comps.forEach((compId) =>
                this.dirtyComponents.add(compId, AssemblyReason.StateUpdated));
            outputPorts.forEach((portId) => {
                const wires = circuit.getWiresForPort(portId).unwrap();
                wires.forEach((wireId) =>
                    this.dirtyWires.add(wireId, AssemblyReason.SignalsChanged));
            });
            inputPorts.forEach((portId) => {
                const port = circuit.getPortByID(portId).unwrap();
                this.dirtyComponents.add(port.parent, AssemblyReason.SignalsChanged);
            });
            this.publish({ type: "onchange" });
        })
    }
}


export function MakeDigitalCircuitAssembler(
    circuit: CircuitInternal,
    sim: DigitalSim,
    options: RenderOptions,
): CircuitAssembler {
    return new DigitalCircuitAssembler(circuit, options, sim, (params) => ({
        // Base types
        [DigitalKinds.Wire]: new DigitalWireAssembler(params, sim),
        [DigitalKinds.Node]: new NodeAssembler(params, {
            "outputs": () => ({ origin: V(0, 0), target: V(0, 0), dir: V(+1, 0) }),
            "inputs":  () => ({ origin: V(0, 0), target: V(0, 0), dir: V(-1, 0) }),
        }),
        [DigitalKinds.IC]: new ICComponentAssembler(params),

        // Inputs
        [DigitalKinds.Switch]:         new SwitchAssembler(params, sim),
        [DigitalKinds.Button]:         new ButtonAssembler(params, sim),
        [DigitalKinds.Clock]:          new ClockAssembler(params, sim),
        [DigitalKinds.ConstantHigh]:   new ConstantHighAssembler(params, sim),
        [DigitalKinds.ConstantLow]:    new ConstantLowAssembler(params, sim),
        [DigitalKinds.ConstantNumber]: new ConstantNumberAssembler(params, sim),

        // Outputs
        [DigitalKinds.LED]:            new LEDAssembler(params, sim),
        [DigitalKinds.SegmentDisplay]: new SegmentDisplayAssembler(params, sim),
        [DigitalKinds.BCDDisplay]:     new BaseDisplayAssembler(params, sim, { font: BCDFont, spacing: 0.5 }),
        [DigitalKinds.ASCIIDisplay]:   new BaseDisplayAssembler(params, sim, { font: ASCIIFont }),
        [DigitalKinds.Oscilloscope]:   new OscilloscopeAssembler(params, sim),

        // Gates
        [DigitalKinds.BUFGate]:  new BUFGateAssembler(params, sim, false),
        [DigitalKinds.NOTGate]:  new BUFGateAssembler(params, sim, true),
        [DigitalKinds.ANDGate]:  new ANDGateAssembler(params, sim, false),
        [DigitalKinds.NANDGate]: new ANDGateAssembler(params, sim, true),
        [DigitalKinds.ORGate]:   new ORGateAssembler(params, sim, { xor: false, not: false }),
        [DigitalKinds.NORGate]:  new ORGateAssembler(params, sim, { xor: false, not: true  }),
        [DigitalKinds.XORGate]:  new ORGateAssembler(params, sim, { xor: true,  not: false }),
        [DigitalKinds.XNORGate]: new ORGateAssembler(params, sim, { xor: true,  not: true  }),

        // FlipFlops
        [DigitalKinds.SRFlipFlop]: new TwoInputFlipFlopAssembler(params, sim, "S", "R"),
        [DigitalKinds.JKFlipFlop]: new TwoInputFlipFlopAssembler(params, sim, "J", "K"),
        [DigitalKinds.DFlipFlop]:  new OneInputFlipFlopAssembler(params, sim, "D"),
        [DigitalKinds.TFlipFlop]:  new OneInputFlipFlopAssembler(params, sim, "T"),

        // Latches
        [DigitalKinds.DLatch]:  new OneInputLatchAssembler(params, sim, "D"),
        [DigitalKinds.SRLatch]: new TwoInputLatchAssembler(params, sim, "S", "R"),

        // Other
        [DigitalKinds.Multiplexer]:   new MultiplexerAssembler(params, sim, "Multiplexer"),
        [DigitalKinds.Demultiplexer]: new MultiplexerAssembler(params, sim, "Demultiplexer"),

        [DigitalKinds.Encoder]: new EncoderAssembler(params, sim),
        [DigitalKinds.Decoder]: new EncoderAssembler(params, sim),

        [DigitalKinds.Comparator]: new ComparatorAssembler(params, sim),

        [DigitalKinds.Label]: new LabelAssembler(params, sim),
    } satisfies Record<
        Exclude<DigitalKinds, DigitalKinds.Port | DigitalKinds.InputPin | DigitalKinds.OutputPin>,
        Assembler
    >));
}
