// package: 
// file: Circuit.proto

import * as jspb from "google-protobuf";

export class Prop extends jspb.Message {
  hasIntVal(): boolean;
  clearIntVal(): void;
  getIntVal(): number;
  setIntVal(value: number): void;

  hasFloatVal(): boolean;
  clearFloatVal(): void;
  getFloatVal(): number;
  setFloatVal(value: number): void;

  hasStrVal(): boolean;
  clearStrVal(): void;
  getStrVal(): string;
  setStrVal(value: string): void;

  hasBoolVal(): boolean;
  clearBoolVal(): void;
  getBoolVal(): boolean;
  setBoolVal(value: boolean): void;

  getPropCase(): Prop.PropCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Prop.AsObject;
  static toObject(includeInstance: boolean, msg: Prop): Prop.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Prop, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Prop;
  static deserializeBinaryFromReader(message: Prop, reader: jspb.BinaryReader): Prop;
}

export namespace Prop {
  export type AsObject = {
    intVal: number,
    floatVal: number,
    strVal: string,
    boolVal: boolean,
  }

  export enum PropCase {
    PROP_NOT_SET = 0,
    INT_VAL = 1,
    FLOAT_VAL = 2,
    STR_VAL = 3,
    BOOL_VAL = 4,
  }
}

export class Port extends jspb.Message {
  getGroup(): string;
  setGroup(value: string): void;

  getIndex(): number;
  setIndex(value: number): void;

  hasName(): boolean;
  clearName(): void;
  getName(): string;
  setName(value: string): void;

  getOtherpropsMap(): jspb.Map<string, Prop>;
  clearOtherpropsMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Port.AsObject;
  static toObject(includeInstance: boolean, msg: Port): Port.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Port, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Port;
  static deserializeBinaryFromReader(message: Port, reader: jspb.BinaryReader): Port;
}

export namespace Port {
  export type AsObject = {
    group: string,
    index: number,
    name: string,
    otherpropsMap: Array<[string, Prop.AsObject]>,
  }
}

export class Component extends jspb.Message {
  getKind(): number;
  setKind(value: number): void;

  hasIcidx(): boolean;
  clearIcidx(): void;
  getIcidx(): number;
  setIcidx(value: number): void;

  hasPortconfigidx(): boolean;
  clearPortconfigidx(): void;
  getPortconfigidx(): number;
  setPortconfigidx(value: number): void;

  hasName(): boolean;
  clearName(): void;
  getName(): string;
  setName(value: string): void;

  hasX(): boolean;
  clearX(): void;
  getX(): number;
  setX(value: number): void;

  hasY(): boolean;
  clearY(): void;
  getY(): number;
  setY(value: number): void;

  hasAngle(): boolean;
  clearAngle(): void;
  getAngle(): number;
  setAngle(value: number): void;

  getOtherpropsMap(): jspb.Map<string, Prop>;
  clearOtherpropsMap(): void;
  clearPortoverridesList(): void;
  getPortoverridesList(): Array<Port>;
  setPortoverridesList(value: Array<Port>): void;
  addPortoverrides(value?: Port, index?: number): Port;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Component.AsObject;
  static toObject(includeInstance: boolean, msg: Component): Component.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Component, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Component;
  static deserializeBinaryFromReader(message: Component, reader: jspb.BinaryReader): Component;
}

export namespace Component {
  export type AsObject = {
    kind: number,
    icidx: number,
    portconfigidx: number,
    name: string,
    x: number,
    y: number,
    angle: number,
    otherpropsMap: Array<[string, Prop.AsObject]>,
    portoverridesList: Array<Port.AsObject>,
  }
}

export class Wire extends jspb.Message {
  hasKind(): boolean;
  clearKind(): void;
  getKind(): number;
  setKind(value: number): void;

  getP1parentidx(): number;
  setP1parentidx(value: number): void;

  getP1group(): number;
  setP1group(value: number): void;

  getP1idx(): number;
  setP1idx(value: number): void;

  getP2parentidx(): number;
  setP2parentidx(value: number): void;

  getP2group(): number;
  setP2group(value: number): void;

  getP2idx(): number;
  setP2idx(value: number): void;

  hasName(): boolean;
  clearName(): void;
  getName(): string;
  setName(value: string): void;

  hasColor(): boolean;
  clearColor(): void;
  getColor(): number;
  setColor(value: number): void;

  getOtherpropsMap(): jspb.Map<string, Prop>;
  clearOtherpropsMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Wire.AsObject;
  static toObject(includeInstance: boolean, msg: Wire): Wire.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Wire, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Wire;
  static deserializeBinaryFromReader(message: Wire, reader: jspb.BinaryReader): Wire;
}

export namespace Wire {
  export type AsObject = {
    kind: number,
    p1parentidx: number,
    p1group: number,
    p1idx: number,
    p2parentidx: number,
    p2group: number,
    p2idx: number,
    name: string,
    color: number,
    otherpropsMap: Array<[string, Prop.AsObject]>,
  }
}

export class Camera extends jspb.Message {
  getX(): number;
  setX(value: number): void;

  getY(): number;
  setY(value: number): void;

  getZoom(): number;
  setZoom(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Camera.AsObject;
  static toObject(includeInstance: boolean, msg: Camera): Camera.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Camera, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Camera;
  static deserializeBinaryFromReader(message: Camera, reader: jspb.BinaryReader): Camera;
}

export namespace Camera {
  export type AsObject = {
    x: number,
    y: number,
    zoom: number,
  }
}

export class CircuitMetadata extends jspb.Message {
  getId(): Uint8Array | string;
  getId_asU8(): Uint8Array;
  getId_asB64(): string;
  setId(value: Uint8Array | string): void;

  getName(): string;
  setName(value: string): void;

  getDesc(): string;
  setDesc(value: string): void;

  getThumb(): string;
  setThumb(value: string): void;

  getVersion(): string;
  setVersion(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CircuitMetadata.AsObject;
  static toObject(includeInstance: boolean, msg: CircuitMetadata): CircuitMetadata.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CircuitMetadata, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CircuitMetadata;
  static deserializeBinaryFromReader(message: CircuitMetadata, reader: jspb.BinaryReader): CircuitMetadata;
}

export namespace CircuitMetadata {
  export type AsObject = {
    id: Uint8Array | string,
    name: string,
    desc: string,
    thumb: string,
    version: string,
  }
}

export class IntegratedCircuitMetadata extends jspb.Message {
  hasMetadata(): boolean;
  clearMetadata(): void;
  getMetadata(): CircuitMetadata | undefined;
  setMetadata(value?: CircuitMetadata): void;

  getDisplaywidth(): number;
  setDisplaywidth(value: number): void;

  getDisplayheight(): number;
  setDisplayheight(value: number): void;

  getPortgroupsMap(): jspb.Map<string, number>;
  clearPortgroupsMap(): void;
  clearPinsList(): void;
  getPinsList(): Array<IntegratedCircuitMetadata.Pin>;
  setPinsList(value: Array<IntegratedCircuitMetadata.Pin>): void;
  addPins(value?: IntegratedCircuitMetadata.Pin, index?: number): IntegratedCircuitMetadata.Pin;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): IntegratedCircuitMetadata.AsObject;
  static toObject(includeInstance: boolean, msg: IntegratedCircuitMetadata): IntegratedCircuitMetadata.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: IntegratedCircuitMetadata, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): IntegratedCircuitMetadata;
  static deserializeBinaryFromReader(message: IntegratedCircuitMetadata, reader: jspb.BinaryReader): IntegratedCircuitMetadata;
}

export namespace IntegratedCircuitMetadata {
  export type AsObject = {
    metadata?: CircuitMetadata.AsObject,
    displaywidth: number,
    displayheight: number,
    portgroupsMap: Array<[string, number]>,
    pinsList: Array<IntegratedCircuitMetadata.Pin.AsObject>,
  }

  export class Pin extends jspb.Message {
    getInternalcompidx(): number;
    setInternalcompidx(value: number): void;

    getInternalportidx(): number;
    setInternalportidx(value: number): void;

    getGroup(): number;
    setGroup(value: number): void;

    getName(): string;
    setName(value: string): void;

    getX(): number;
    setX(value: number): void;

    getY(): number;
    setY(value: number): void;

    getDx(): number;
    setDx(value: number): void;

    getDy(): number;
    setDy(value: number): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Pin.AsObject;
    static toObject(includeInstance: boolean, msg: Pin): Pin.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Pin, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Pin;
    static deserializeBinaryFromReader(message: Pin, reader: jspb.BinaryReader): Pin;
  }

  export namespace Pin {
    export type AsObject = {
      internalcompidx: number,
      internalportidx: number,
      group: number,
      name: string,
      x: number,
      y: number,
      dx: number,
      dy: number,
    }
  }
}

export class IntegratedCircuit extends jspb.Message {
  hasMetadata(): boolean;
  clearMetadata(): void;
  getMetadata(): IntegratedCircuitMetadata | undefined;
  setMetadata(value?: IntegratedCircuitMetadata): void;

  clearComponentsList(): void;
  getComponentsList(): Array<Component>;
  setComponentsList(value: Array<Component>): void;
  addComponents(value?: Component, index?: number): Component;

  clearWiresList(): void;
  getWiresList(): Array<Wire>;
  setWiresList(value: Array<Wire>): void;
  addWires(value?: Wire, index?: number): Wire;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): IntegratedCircuit.AsObject;
  static toObject(includeInstance: boolean, msg: IntegratedCircuit): IntegratedCircuit.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: IntegratedCircuit, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): IntegratedCircuit;
  static deserializeBinaryFromReader(message: IntegratedCircuit, reader: jspb.BinaryReader): IntegratedCircuit;
}

export namespace IntegratedCircuit {
  export type AsObject = {
    metadata?: IntegratedCircuitMetadata.AsObject,
    componentsList: Array<Component.AsObject>,
    wiresList: Array<Wire.AsObject>,
  }
}

export class Circuit extends jspb.Message {
  hasMetadata(): boolean;
  clearMetadata(): void;
  getMetadata(): CircuitMetadata | undefined;
  setMetadata(value?: CircuitMetadata): void;

  hasCamera(): boolean;
  clearCamera(): void;
  getCamera(): Camera | undefined;
  setCamera(value?: Camera): void;

  clearIcsList(): void;
  getIcsList(): Array<IntegratedCircuit>;
  setIcsList(value: Array<IntegratedCircuit>): void;
  addIcs(value?: IntegratedCircuit, index?: number): IntegratedCircuit;

  clearComponentsList(): void;
  getComponentsList(): Array<Component>;
  setComponentsList(value: Array<Component>): void;
  addComponents(value?: Component, index?: number): Component;

  clearWiresList(): void;
  getWiresList(): Array<Wire>;
  setWiresList(value: Array<Wire>): void;
  addWires(value?: Wire, index?: number): Wire;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Circuit.AsObject;
  static toObject(includeInstance: boolean, msg: Circuit): Circuit.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Circuit, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Circuit;
  static deserializeBinaryFromReader(message: Circuit, reader: jspb.BinaryReader): Circuit;
}

export namespace Circuit {
  export type AsObject = {
    metadata?: CircuitMetadata.AsObject,
    camera?: Camera.AsObject,
    icsList: Array<IntegratedCircuit.AsObject>,
    componentsList: Array<Component.AsObject>,
    wiresList: Array<Wire.AsObject>,
  }
}

