// This file has "bridge" functions from the internal rep (DigitalCircuit.Schema)
// to the wire rep (DigitalCircuit.proto) and vice versa.
import {Schema} from "shared/api/circuit/schema";

import {DigitalSchema} from "digital/api/circuit/schema";
import {Signal} from "digital/api/circuit/schema/Signal";

import {CircuitToProto, MakeConversionMaps, ProtoToCircuit} from "shared/site/proto/bridge";

import * as DigitalProtoSchema from "./DigitalCircuit";
import {CreateCircuit, DigitalCircuit, ReadonlyDigitalCircuit} from "digital/api/circuit/public";


const InputOutputGroups = { "inputs": 0, "outputs": 1 };
const FlipFlopGroups = { "pre": 0, "clr": 1, "clk": 2, "Q": 3, "Qinv": 4 };
const LatchGroups = { "E": 0, "Q": 1, "Qinv": 2 };
export const DigitalKindMaps = MakeConversionMaps({
    // IC
    "IC": {
        kind:  0,
        ports: {},
    },

    // IC Pins
    "InputPin":  { kind: 1, ports: { "outputs": 0 } },
    "OutputPin": { kind: 2, ports: { "inputs": 0 } },

    // Node
    "DigitalNode": { kind: 3, ports: InputOutputGroups },

    // Inputs
    "Button":         { kind: 4, ports: { "outputs": 0 } },
    "Switch":         { kind: 5, ports: { "outputs": 0 } },
    "ConstantLow":    { kind: 6, ports: { "outputs": 0 } },
    "ConstantHigh":   { kind: 7, ports: { "outputs": 0 } },
    "ConstantNumber": { kind: 8, ports: { "outputs": 0 } },
    "Clock":          { kind: 9, ports: { "outputs": 0 } },

    // Outputs
    "LED":            { kind: 10, ports: { "inputs": 0 } },
    "SegmentDisplay": { kind: 11, ports: { "inputs": 0 } },
    "BCDDisplay":     { kind: 12, ports: { "inputs": 0 } },
    "ASCIIDisplay":   { kind: 13, ports: { "inputs": 0 } },
    "Oscilloscope":   { kind: 14, ports: { "inputs": 0 } },

    // Gates
    "BUFGate":  { kind: 15, ports: InputOutputGroups },
    "NOTGate":  { kind: 16, ports: InputOutputGroups },
    "ANDGate":  { kind: 17, ports: InputOutputGroups },
    "NANDGate": { kind: 18, ports: InputOutputGroups },
    "ORGate":   { kind: 19, ports: InputOutputGroups },
    "NORGate":  { kind: 20, ports: InputOutputGroups },
    "XORGate":  { kind: 21, ports: InputOutputGroups },
    "XNORGate": { kind: 22, ports: InputOutputGroups },

    // Flip Flops
    "SRFlipFlop": { kind: 23, ports: { ...FlipFlopGroups, "S": 5, "R": 6 } },
    "JKFlipFlop": { kind: 24, ports: { ...FlipFlopGroups, "J": 5, "K": 6 } },
    "DFlipFlop":  { kind: 25, ports: { ...FlipFlopGroups, "D": 5 } },
    "TFlipFlop":  { kind: 26, ports: { ...FlipFlopGroups, "T": 5 } },

    // Latches
    "DLatch":  { kind: 27, ports: { ...LatchGroups, "D": 3 } },
    "SRLatch": { kind: 28, ports: { ...LatchGroups, "S": 3, "R": 4 } },

    // Other
    "Multiplexer":   { kind: 29, ports: { ...InputOutputGroups, "selects": 2 } },
    "Demultiplexer": { kind: 30, ports: { ...InputOutputGroups, "selects": 2 } },
    "Encoder":       { kind: 31, ports: InputOutputGroups },
    "Decoder":       { kind: 32, ports: InputOutputGroups },
    "Comparator":    { kind: 33, ports: { "inputsA": 0, "inputsB": 1, "lt": 2, "eq": 3, "gt": 4 } },
    "Label":         { kind: 34, ports: {} },
}, {
    "DigitalWire": 0,
}, {
    "DigitalPort": 0,
});


export const StateFullKinds: Set<string> = new Set([
    "Switch", "Clock", "Oscilloscope", "SRFlipFlop", "JKFlipFlop", "DFlipFlop", "TFlipFlop", "DLatch", "SRLatch",
])


// Compresses ternary signals to uint32s for added efficiency.
// We can fit ~20 ternary bits in 32 binary bits.
export function CompressSignals(signals: number[]): number[] {
    return signals.chunk(20)
        // Need to pad the final chunk if it's not 20-signals-long
        // otherwise it's interpreted incorrectly.
        .map((chunk) => parseInt(chunk.padEnd(20, 0).join(""), 3));
}
// Uncompresses ternary signals from uint32s.
export function UncompressSignals(signals: number[]): number[] {
    return signals.flatMap((n) => [...n.toString(3).padStart(20, "0")].map((v) => parseInt(v)))
}

export function DigitalCircuitToProto(circuit: DigitalCircuit): DigitalProtoSchema.DigitalCircuit {
    function ConvertSignal(signal: Signal): number {
        return (signal === Signal.Off
            ? 0
            : (signal === Signal.On)
            ? 1
            : (signal === Signal.Metastable)
            ? 2
            : 0);
    }

    function ConvertSimState(circuit: ReadonlyDigitalCircuit, state: DigitalSchema.DigitalSimState, icId?: Schema.GUID): DigitalProtoSchema.DigitalSimState {
        // MUST SORT BY THE SAME METRIC AS `CircuitToProto`
        const comps = (icId ? circuit.getIC(icId)!.components : circuit.getComponents()).sort((c1, c2) => (c1.zIndex - c2.zIndex));
        // Only need to serialize output port signals, since input
        // ports are simply derived from their connected output port.
        const ports = comps.flatMap((c) => c.allPorts).filter((p) => (p.isOutputPort));
        return {
            signals: CompressSignals(ports.map((p) => ConvertSignal(state.signals[p.id]))),

            states: comps
                .filter((c) => StateFullKinds.has(c.kind))
                .map((c) => ({ state: state.states[c.id] })),

            icStates: comps
                .filter((c) => c.isIC())
                .map((c) => ConvertSimState(circuit, state.icStates[c.id], c.kind)),
        };
    }

    return DigitalProtoSchema.DigitalCircuit.create({
        circuit: CircuitToProto(circuit, DigitalKindMaps[0]),

        propagationTime:    circuit.propagationTime,
        icInitialSimStates: circuit.getICs().map((ic) => ConvertSimState(circuit, ic.initialSimState, ic.id)),
        simState:           ConvertSimState(circuit, circuit.sim.state),
    });
}


export function DigitalProtoToCircuit(proto: DigitalProtoSchema.DigitalCircuit): DigitalCircuit {
    function ConvertSignal(signal: number): Signal {
        return (signal === 0
            ? Signal.Off
            : (signal === 1)
            ? Signal.On
            : (signal === 2)
            ? Signal.Metastable
            : Signal.Off);
    }

    function ConvertSimState(circuit: ReadonlyDigitalCircuit, state: DigitalProtoSchema.DigitalSimState, icId?: Schema.GUID): DigitalSchema.DigitalSimState {
        const comps = (icId ? circuit.getIC(icId)!.components : circuit.getComponents());
        const ports = comps.flatMap((c) => c.allPorts).filter((p) => (p.isOutputPort));
        return {
            signals: Object.fromEntries(ports
                // Uncompress signals as uint32 -> 0,1,2
                .zip(UncompressSignals(state.signals))
                .flatMap(([p, s]) => [
                    [p.id, ConvertSignal(s)],
                    // Also load the input ports this port is connected to (if any)
                    ...p.connectedPorts.map((p2) => [p2.id, ConvertSignal(s)]),
                ])),

            states: Object.fromEntries(comps
                .filter((c) => StateFullKinds.has(c.kind))
                .map((c) => c.id)
                .zip(state.states.map((s) => (s.state)))),

            icStates: Object.fromEntries(comps
                .filter((c) => c.isIC())
                .zip(state.icStates)
                .map(([c, icState]) => [c.id, ConvertSimState(circuit, icState, c.kind)])),
        };
    }

    if (!proto.circuit)
        throw new Error(`DigitalProtoToSchema: Failed to find circuit! ${proto}`);
    if (!proto.simState)
        throw new Error(`DigitalProtoToSchema: Failed to find simState! ${proto}`);

    const [circuit, state] = CreateCircuit(proto.circuit!.metadata!.id);

    ProtoToCircuit(proto.circuit, circuit, (id) => CreateCircuit(id)[0], DigitalKindMaps[1]);

    circuit.propagationTime = proto.propagationTime;

    // Load simulation state
    for (const [ic, initialSimState] of proto.circuit.ics.zip(proto.icInitialSimStates)) {
        const id = ic.metadata!.metadata!.id;
        state.sim.loadICState(id, ConvertSimState(circuit, initialSimState, id));
    }

    state.sim.loadState(ConvertSimState(circuit, proto.simState));

    return circuit;
}
