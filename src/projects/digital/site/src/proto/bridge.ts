// This file has "bridge" functions from the internal rep (DigitalCircuit.Schema)
// to the wire rep (DigitalCircuit.proto) and vice versa.

import {MapObj} from "shared/api/circuit/utils/Functions";

import {DigitalSchema} from "digital/api/circuit/schema";
import {Signal} from "digital/api/circuit/schema/Signal";

import {ProtoToSchema, SchemaToProto} from "shared/site/proto/bridge";

import * as DigitalProtoSchema from "./DigitalCircuit";


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

    function ConvertSimState(state: DigitalSchema.DigitalSimState): DigitalProtoSchema.DigitalSimState {
        return {
            signals:  MapObj(state.signals,  ([_id, signal]) => ConvertSignal(signal)),
            states:   MapObj(state.states,   ([_id, state])  => ({ state: state.map(ConvertSignal) })),
            icStates: MapObj(state.icStates, ([_id, state])  => ConvertSimState(state)),
        };
    }

    return DigitalProtoSchema.DigitalCircuit.create({
        circuit: SchemaToProto(schema),

        propagationTime:    schema.propagationTime,
        icInitialSimStates: schema.initialICSimStates.map(ConvertSimState),
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

    function ConvertSimState(state: DigitalProtoSchema.DigitalSimState): DigitalSchema.DigitalSimState {
        return {
            signals:  MapObj(state.signals,  ([_id, signal]) => ConvertSignal(signal)),
            states:   MapObj(state.states,   ([_id, state])  => state.state.map(ConvertSignal)),
            icStates: MapObj(state.icStates, ([_id, state])  => ConvertSimState(state)),
        };
    }

    if (!proto.circuit)
        throw new Error(`DigitalProtoToSchema: Failed to find circuit! ${proto}`);
    if (!proto.simState)
        throw new Error(`DigitalProtoToSchema: Failed to find simState! ${proto}`);

    const schema = ProtoToSchema(proto.circuit);

    return {
        ...schema,

        initialICSimStates: proto.icInitialSimStates.map(ConvertSimState),
        propagationTime:    proto.propagationTime,
        simState:           ConvertSimState(proto.simState),
    }
}
