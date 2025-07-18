// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.7.0
//   protoc               v6.30.2
// source: src/projects/digital/site/src/proto/DigitalCircuit.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { Circuit } from "../../../../shared/site/src/proto/Circuit";

export const protobufPackage = "";

/** TODO[master] - .gitignore the generated .ts and generate it automatically via webpack? */

export interface DigitalSimState {
  /**
   * Array of signals corresponding to the port in filter(flat(circuit.components.map(allPorts)), 'is output port')
   * -> Compressed into 32bit ints storing 20 signals (ternaries) each
   */
  signals: number[];
  /** Array of states corresponding to the component in filter(circuit.components, 'is stateful') */
  states: DigitalSimState_State[];
  /** Array of states corresponding to the IC component in filter(circuit.components, 'is IC') */
  icStates: DigitalSimState[];
}

export interface DigitalSimState_State {
  /** States are arbitrary numbers (usually signals) */
  state: number[];
}

export interface DigitalCircuit {
  circuit: Circuit | undefined;
  propagationTime: number;
  /** Array of IC states corresponding to circuit.ics */
  icInitialSimStates: DigitalSimState[];
  simState: DigitalSimState | undefined;
}

function createBaseDigitalSimState(): DigitalSimState {
  return { signals: [], states: [], icStates: [] };
}

export const DigitalSimState: MessageFns<DigitalSimState> = {
  encode(message: DigitalSimState, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    writer.uint32(10).fork();
    for (const v of message.signals) {
      writer.uint32(v);
    }
    writer.join();
    for (const v of message.states) {
      DigitalSimState_State.encode(v!, writer.uint32(26).fork()).join();
    }
    for (const v of message.icStates) {
      DigitalSimState.encode(v!, writer.uint32(34).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): DigitalSimState {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDigitalSimState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag === 8) {
            message.signals.push(reader.uint32());

            continue;
          }

          if (tag === 10) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.signals.push(reader.uint32());
            }

            continue;
          }

          break;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.states.push(DigitalSimState_State.decode(reader, reader.uint32()));
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.icStates.push(DigitalSimState.decode(reader, reader.uint32()));
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): DigitalSimState {
    return {
      signals: globalThis.Array.isArray(object?.signals) ? object.signals.map((e: any) => globalThis.Number(e)) : [],
      states: globalThis.Array.isArray(object?.states)
        ? object.states.map((e: any) => DigitalSimState_State.fromJSON(e))
        : [],
      icStates: globalThis.Array.isArray(object?.icStates)
        ? object.icStates.map((e: any) => DigitalSimState.fromJSON(e))
        : [],
    };
  },

  toJSON(message: DigitalSimState): unknown {
    const obj: any = {};
    if (message.signals?.length) {
      obj.signals = message.signals.map((e) => Math.round(e));
    }
    if (message.states?.length) {
      obj.states = message.states.map((e) => DigitalSimState_State.toJSON(e));
    }
    if (message.icStates?.length) {
      obj.icStates = message.icStates.map((e) => DigitalSimState.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<DigitalSimState>, I>>(base?: I): DigitalSimState {
    return DigitalSimState.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<DigitalSimState>, I>>(object: I): DigitalSimState {
    const message = createBaseDigitalSimState();
    message.signals = object.signals?.map((e) => e) || [];
    message.states = object.states?.map((e) => DigitalSimState_State.fromPartial(e)) || [];
    message.icStates = object.icStates?.map((e) => DigitalSimState.fromPartial(e)) || [];
    return message;
  },
};

function createBaseDigitalSimState_State(): DigitalSimState_State {
  return { state: [] };
}

export const DigitalSimState_State: MessageFns<DigitalSimState_State> = {
  encode(message: DigitalSimState_State, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    writer.uint32(10).fork();
    for (const v of message.state) {
      writer.int32(v);
    }
    writer.join();
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): DigitalSimState_State {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDigitalSimState_State();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag === 8) {
            message.state.push(reader.int32());

            continue;
          }

          if (tag === 10) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.state.push(reader.int32());
            }

            continue;
          }

          break;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): DigitalSimState_State {
    return { state: globalThis.Array.isArray(object?.state) ? object.state.map((e: any) => globalThis.Number(e)) : [] };
  },

  toJSON(message: DigitalSimState_State): unknown {
    const obj: any = {};
    if (message.state?.length) {
      obj.state = message.state.map((e) => Math.round(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<DigitalSimState_State>, I>>(base?: I): DigitalSimState_State {
    return DigitalSimState_State.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<DigitalSimState_State>, I>>(object: I): DigitalSimState_State {
    const message = createBaseDigitalSimState_State();
    message.state = object.state?.map((e) => e) || [];
    return message;
  },
};

function createBaseDigitalCircuit(): DigitalCircuit {
  return { circuit: undefined, propagationTime: 0, icInitialSimStates: [], simState: undefined };
}

export const DigitalCircuit: MessageFns<DigitalCircuit> = {
  encode(message: DigitalCircuit, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.circuit !== undefined) {
      Circuit.encode(message.circuit, writer.uint32(10).fork()).join();
    }
    if (message.propagationTime !== 0) {
      writer.uint32(21).float(message.propagationTime);
    }
    for (const v of message.icInitialSimStates) {
      DigitalSimState.encode(v!, writer.uint32(26).fork()).join();
    }
    if (message.simState !== undefined) {
      DigitalSimState.encode(message.simState, writer.uint32(34).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): DigitalCircuit {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDigitalCircuit();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.circuit = Circuit.decode(reader, reader.uint32());
          continue;
        }
        case 2: {
          if (tag !== 21) {
            break;
          }

          message.propagationTime = reader.float();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.icInitialSimStates.push(DigitalSimState.decode(reader, reader.uint32()));
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.simState = DigitalSimState.decode(reader, reader.uint32());
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): DigitalCircuit {
    return {
      circuit: isSet(object.circuit) ? Circuit.fromJSON(object.circuit) : undefined,
      propagationTime: isSet(object.propagationTime) ? globalThis.Number(object.propagationTime) : 0,
      icInitialSimStates: globalThis.Array.isArray(object?.icInitialSimStates)
        ? object.icInitialSimStates.map((e: any) => DigitalSimState.fromJSON(e))
        : [],
      simState: isSet(object.simState) ? DigitalSimState.fromJSON(object.simState) : undefined,
    };
  },

  toJSON(message: DigitalCircuit): unknown {
    const obj: any = {};
    if (message.circuit !== undefined) {
      obj.circuit = Circuit.toJSON(message.circuit);
    }
    if (message.propagationTime !== 0) {
      obj.propagationTime = message.propagationTime;
    }
    if (message.icInitialSimStates?.length) {
      obj.icInitialSimStates = message.icInitialSimStates.map((e) => DigitalSimState.toJSON(e));
    }
    if (message.simState !== undefined) {
      obj.simState = DigitalSimState.toJSON(message.simState);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<DigitalCircuit>, I>>(base?: I): DigitalCircuit {
    return DigitalCircuit.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<DigitalCircuit>, I>>(object: I): DigitalCircuit {
    const message = createBaseDigitalCircuit();
    message.circuit = (object.circuit !== undefined && object.circuit !== null)
      ? Circuit.fromPartial(object.circuit)
      : undefined;
    message.propagationTime = object.propagationTime ?? 0;
    message.icInitialSimStates = object.icInitialSimStates?.map((e) => DigitalSimState.fromPartial(e)) || [];
    message.simState = (object.simState !== undefined && object.simState !== null)
      ? DigitalSimState.fromPartial(object.simState)
      : undefined;
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}

export interface MessageFns<T> {
  encode(message: T, writer?: BinaryWriter): BinaryWriter;
  decode(input: BinaryReader | Uint8Array, length?: number): T;
  fromJSON(object: any): T;
  toJSON(message: T): unknown;
  create<I extends Exact<DeepPartial<T>, I>>(base?: I): T;
  fromPartial<I extends Exact<DeepPartial<T>, I>>(object: I): T;
}
