// This file has "bridge" functions from the internal rep (DigitalCircuit.Schema)
// to the wire rep (DigitalCircuit.proto) and vice versa.

import {MapObj} from "shared/api/circuit/utils/Functions";
import {Schema} from "shared/api/circuit/schema";

import {DigitalSchema} from "digital/api/circuit/schema";
import {Signal} from "digital/api/circuit/schema/Signal";

import {ProtoToSchema, SchemaToProto} from "shared/site/proto/bridge";

import * as DigitalProtoSchema from "./DigitalCircuit";


function FindComponent(objs: Schema.Obj[], compId: Schema.GUID): Schema.Component | undefined {
    return objs.find((o) => (o.baseKind === "Component" && o.id === compId)) as Schema.Component | undefined;
}

export function DigitalSchemaToProto(schema: DigitalSchema.DigitalCircuit): DigitalProtoSchema.DigitalCircuit {
    function ConvertSignal(signal: Signal): DigitalProtoSchema.DigitalSimState_Signal {
        return (signal === Signal.On
            ? DigitalProtoSchema.DigitalSimState_Signal.On
            : (signal === Signal.Off)
            ? DigitalProtoSchema.DigitalSimState_Signal.Off
            : (signal === Signal.Metastable)
            ? DigitalProtoSchema.DigitalSimState_Signal.Metastable
            : DigitalProtoSchema.DigitalSimState_Signal.UNRECOGNIZED);
    }

    function ConvertSimState(state: DigitalSchema.DigitalSimState, icId?: Schema.GUID): DigitalProtoSchema.DigitalSimState {
        const objs = (icId ? schema.ics.find((ic) => (ic.metadata.id === icId))!.objects : schema.objects);
        return {
            signals: objs
                .filter((o) => (o.baseKind === "Port"))
                .map((p) => ConvertSignal(state.signals[p.id])),
            states:   MapObj(state.states,   ([_id, state])  => ({ state: state.map(ConvertSignal) })),
            icStates: MapObj(state.icStates, ([id, state]) => ConvertSimState(state, FindComponent(objs, id)?.icId)),
        };
    }

    return DigitalProtoSchema.DigitalCircuit.create({
        circuit: SchemaToProto(schema),

        propagationTime:    schema.propagationTime,
        icInitialSimStates: schema.initialICSimStates.zip(schema.ics).map(([sim, ic]) => ConvertSimState(sim, ic.metadata.id)),
        simState:           ConvertSimState(schema.simState),
    });
}

export function DigitalProtoToSchema(proto: DigitalProtoSchema.DigitalCircuit): DigitalSchema.DigitalCircuit {
    function ConvertSignal(signal: DigitalProtoSchema.DigitalSimState_Signal): Signal {
        return (signal === DigitalProtoSchema.DigitalSimState_Signal.On
            ? Signal.On
            : (signal === DigitalProtoSchema.DigitalSimState_Signal.Off)
            ? Signal.Off
            : (signal === DigitalProtoSchema.DigitalSimState_Signal.Metastable)
            ? Signal.Metastable
            : Signal.Off);
    }

    function ConvertSimState(state: DigitalProtoSchema.DigitalSimState, icId?: Schema.GUID): DigitalSchema.DigitalSimState {
        const objs = (icId ? schema.ics.find((ic) => (ic.metadata.id === icId))!.objects : schema.objects);
        return {
            signals: Object.fromEntries(objs
                .filter((o) => (o.baseKind === "Port"))
                .zip(state.signals)
                .map(([p, s]) => [p.id, ConvertSignal(s)])),
            states:   MapObj(state.states,   ([_id, state])  => state.state.map(ConvertSignal)),
            icStates: MapObj(state.icStates, ([id, state]) =>
                ConvertSimState(state, FindComponent(objs, `${id}`)?.icId)),
        };
    }

    if (!proto.circuit)
        throw new Error(`DigitalProtoToSchema: Failed to find circuit! ${proto}`);
    if (!proto.simState)
        throw new Error(`DigitalProtoToSchema: Failed to find simState! ${proto}`);

    const schema = ProtoToSchema(proto.circuit);

    return {
        ...schema,

        initialICSimStates: proto.icInitialSimStates.zip(schema.ics).map(([sim, ic]) => ConvertSimState(sim, ic.metadata.id)),
        propagationTime:    proto.propagationTime,
        simState:           ConvertSimState(proto.simState),
    }
}
