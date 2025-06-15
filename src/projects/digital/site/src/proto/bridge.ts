// This file has "bridge" functions from the internal rep (DigitalCircuit.Schema)
// to the wire rep (DigitalCircuit.proto) and vice versa.
import * as uuid from "uuid";

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
})


export function DigitalCircuitToProto(circuit: DigitalCircuit): DigitalProtoSchema.DigitalCircuit {
    function ConvertSignal(signal: Signal): DigitalProtoSchema.DigitalSimState_Signal {
        return (signal === Signal.On
            ? DigitalProtoSchema.DigitalSimState_Signal.On
            : (signal === Signal.Off)
            ? DigitalProtoSchema.DigitalSimState_Signal.Off
            : (signal === Signal.Metastable)
            ? DigitalProtoSchema.DigitalSimState_Signal.Metastable
            : DigitalProtoSchema.DigitalSimState_Signal.UNRECOGNIZED);
    }

    function ConvertSimState(circuit: ReadonlyDigitalCircuit, state: DigitalSchema.DigitalSimState, icId?: Schema.GUID): DigitalProtoSchema.DigitalSimState {
        const comps = (icId ? circuit.getIC(icId)!.components : circuit.getComponents());
        const ports = comps.flatMap((c) => c.allPorts);
        return {
            signals: ports.map((p) => ConvertSignal(state.signals[p.id] ?? Signal.Off)),
            states:  Object.fromEntries(Object.entries(state.states)
                .map(([id, state]) =>
                    [comps.findIndex((c) => (c.id === id)), ({ state: state.map(ConvertSignal) })])),
            icStates: Object.fromEntries(Object.entries(state.icStates)
                .map(([id, state]) =>
                    [comps.findIndex((c) => (c.id === id)), ConvertSimState(circuit, state, comps.find((c) => (c.id === id))!.kind)])),
        };
    }

    return DigitalProtoSchema.DigitalCircuit.create({
        circuit: CircuitToProto(circuit, DigitalKindMaps[0]),

        propagationTime:    circuit.propagationTime,
        icInitialSimStates: circuit.getICs().map((ic) => ConvertSimState(circuit, ic.initialSimState, ic.id)),
        simState:           ConvertSimState(circuit, circuit.simState),
    });
}


export function DigitalProtoToCircuit(proto: DigitalProtoSchema.DigitalCircuit): DigitalCircuit {
    function ConvertId(id: Uint8Array): Schema.GUID {
        return uuid.stringify(id);
    }

    function ConvertSignal(signal: DigitalProtoSchema.DigitalSimState_Signal): Signal {
        return (signal === DigitalProtoSchema.DigitalSimState_Signal.On
            ? Signal.On
            : (signal === DigitalProtoSchema.DigitalSimState_Signal.Off)
            ? Signal.Off
            : (signal === DigitalProtoSchema.DigitalSimState_Signal.Metastable)
            ? Signal.Metastable
            : Signal.Off);
    }

    function ConvertSimState(circuit: ReadonlyDigitalCircuit, state: DigitalProtoSchema.DigitalSimState, icId?: Schema.GUID): DigitalSchema.DigitalSimState {
        const comps = (icId ? circuit.getIC(icId)!.components : circuit.getComponents());
        const ports = comps.flatMap((c) => c.allPorts);
        return {
            signals: Object.fromEntries(ports.zip(state.signals).map(([p, s]) => [p.id, ConvertSignal(s)])),
            states:  Object.fromEntries(Object.entries(state.states)
                .map(([idx, state]) => [comps[parseInt(idx)].id, state.state.map(ConvertSignal)])),
            icStates: Object.fromEntries(Object.entries(state.icStates)
                .map(([idx, state]) => [comps[parseInt(idx)].id, ConvertSimState(circuit, state, comps[parseInt(idx)].kind)])),
        };
    }

    if (!proto.circuit)
        throw new Error(`DigitalProtoToSchema: Failed to find circuit! ${proto}`);
    if (!proto.simState)
        throw new Error(`DigitalProtoToSchema: Failed to find simState! ${proto}`);

    const [circuit, state] = CreateCircuit(ConvertId(proto.circuit!.metadata!.id));

    ProtoToCircuit(proto.circuit, circuit, (id) => CreateCircuit(id)[0], DigitalKindMaps[1]);

    circuit.propagationTime = proto.propagationTime;

    // Load simulation state
    for (const [ic, initialSimState] of proto.circuit.ics.zip(proto.icInitialSimStates)) {
        const id = ConvertId(ic.metadata!.metadata!.id);
        state.sim.loadICState(id, ConvertSimState(circuit, initialSimState, id));
    }
    state.sim.loadState(ConvertSimState(circuit, proto.simState));

    return circuit;
}
