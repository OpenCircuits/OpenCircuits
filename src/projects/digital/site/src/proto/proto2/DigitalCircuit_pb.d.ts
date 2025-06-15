// package: 
// file: src/projects/digital/site/src/proto/DigitalCircuit.proto

import * as jspb from "google-protobuf";
import * as src_projects_shared_site_src_proto_Circuit_pb from "../../../../../../../src/projects/shared/site/src/proto/proto2/Circuit_pb";

export class DigitalSimState extends jspb.Message {
  clearSignalsList(): void;
  getSignalsList(): Array<DigitalSimState.SignalMap[keyof DigitalSimState.SignalMap]>;
  setSignalsList(value: Array<DigitalSimState.SignalMap[keyof DigitalSimState.SignalMap]>): void;
  addSignals(value: DigitalSimState.SignalMap[keyof DigitalSimState.SignalMap], index?: number): DigitalSimState.SignalMap[keyof DigitalSimState.SignalMap];

  getStatesMap(): jspb.Map<number, DigitalSimState.State>;
  clearStatesMap(): void;
  getIcstatesMap(): jspb.Map<number, DigitalSimState>;
  clearIcstatesMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DigitalSimState.AsObject;
  static toObject(includeInstance: boolean, msg: DigitalSimState): DigitalSimState.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DigitalSimState, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DigitalSimState;
  static deserializeBinaryFromReader(message: DigitalSimState, reader: jspb.BinaryReader): DigitalSimState;
}

export namespace DigitalSimState {
  export type AsObject = {
    signalsList: Array<DigitalSimState.SignalMap[keyof DigitalSimState.SignalMap]>,
    statesMap: Array<[number, DigitalSimState.State.AsObject]>,
    icstatesMap: Array<[number, DigitalSimState.AsObject]>,
  }

  export class State extends jspb.Message {
    clearStateList(): void;
    getStateList(): Array<DigitalSimState.SignalMap[keyof DigitalSimState.SignalMap]>;
    setStateList(value: Array<DigitalSimState.SignalMap[keyof DigitalSimState.SignalMap]>): void;
    addState(value: DigitalSimState.SignalMap[keyof DigitalSimState.SignalMap], index?: number): DigitalSimState.SignalMap[keyof DigitalSimState.SignalMap];

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): State.AsObject;
    static toObject(includeInstance: boolean, msg: State): State.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: State, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): State;
    static deserializeBinaryFromReader(message: State, reader: jspb.BinaryReader): State;
  }

  export namespace State {
    export type AsObject = {
      stateList: Array<DigitalSimState.SignalMap[keyof DigitalSimState.SignalMap]>,
    }
  }

  export interface SignalMap {
    OFF: 0;
    ON: 1;
    METASTABLE: 2;
  }

  export const Signal: SignalMap;
}

export class DigitalCircuit extends jspb.Message {
  hasCircuit(): boolean;
  clearCircuit(): void;
  getCircuit(): src_projects_shared_site_src_proto_Circuit_pb.Circuit | undefined;
  setCircuit(value?: src_projects_shared_site_src_proto_Circuit_pb.Circuit): void;

  getPropagationtime(): number;
  setPropagationtime(value: number): void;

  clearIcinitialsimstatesList(): void;
  getIcinitialsimstatesList(): Array<DigitalSimState>;
  setIcinitialsimstatesList(value: Array<DigitalSimState>): void;
  addIcinitialsimstates(value?: DigitalSimState, index?: number): DigitalSimState;

  hasSimstate(): boolean;
  clearSimstate(): void;
  getSimstate(): DigitalSimState | undefined;
  setSimstate(value?: DigitalSimState): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DigitalCircuit.AsObject;
  static toObject(includeInstance: boolean, msg: DigitalCircuit): DigitalCircuit.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DigitalCircuit, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DigitalCircuit;
  static deserializeBinaryFromReader(message: DigitalCircuit, reader: jspb.BinaryReader): DigitalCircuit;
}

export namespace DigitalCircuit {
  export type AsObject = {
    circuit?: src_projects_shared_site_src_proto_Circuit_pb.Circuit.AsObject,
    propagationtime: number,
    icinitialsimstatesList: Array<DigitalSimState.AsObject>,
    simstate?: DigitalSimState.AsObject,
  }
}

