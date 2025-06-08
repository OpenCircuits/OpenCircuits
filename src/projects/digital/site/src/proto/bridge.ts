// This file has "bridge" functions from the internal rep (DigitalCircuit.Schema)
// to the wire rep (DigitalCircuit.proto) and vice versa.
import * as uuid from "uuid";

import {Schema} from "shared/api/circuit/schema";

import {DigitalSchema} from "digital/api/circuit/schema";
import {Signal} from "digital/api/circuit/schema/Signal";

import {CircuitToProto, ProtoToCircuit} from "shared/site/proto/bridge";

import * as DigitalProtoSchema from "./DigitalCircuit";
import {CreateCircuit, DigitalCircuit, ReadonlyDigitalCircuit} from "digital/api/circuit/public";


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

    const proto = DigitalProtoSchema.DigitalCircuit.create({
        circuit: CircuitToProto(circuit),

        propagationTime:    circuit.propagationTime,
        icInitialSimStates: circuit.getICs().map((ic) => ConvertSimState(circuit, ic.initialSimState, ic.id)),
        simState:           ConvertSimState(circuit, circuit.simState),
    });

    console.log(proto);

    return proto;
}


export function DigitalProtoToCircuit(proto: DigitalProtoSchema.DigitalCircuit): DigitalCircuit {
    console.log(proto);

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

    ProtoToCircuit(proto.circuit, circuit, (id) => CreateCircuit(id)[0]);

    circuit.propagationTime = proto.propagationTime;

    // Load simulation state
    for (const [ic, initialSimState] of proto.circuit.ics.zip(proto.icInitialSimStates)) {
        const id = ConvertId(ic.metadata!.metadata!.id);
        state.sim.loadICState(id, ConvertSimState(circuit, initialSimState, id));
    }
    state.sim.loadState(ConvertSimState(circuit, proto.simState));

    return circuit;
}
