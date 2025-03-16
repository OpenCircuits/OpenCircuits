import {Vector} from "Vector";

import {GUID} from "shared/api/circuit/schema/GUID";

import {FastCircuitDiff} from "shared/api/circuit/internal/impl/FastCircuitDiff";

import {Component, ReadonlyComponent}     from "./Component";
import {ComponentInfo} from "./ComponentInfo";
import {Obj, ReadonlyObj}           from "./Obj";
import {Port, ReadonlyPort}          from "./Port";
import {ReadonlyWire, Wire}          from "./Wire";
import {Selections}    from "./Selections";
import {Schema} from "../schema";
import {Observable} from "../utils/Observable";


export type {CircuitMetadata} from "shared/api/circuit/schema/CircuitMetadata";

// TODO[model_refactor](leon) - make this more user friendly
export type CircuitEvent = {
    type: "change";
    diff: FastCircuitDiff;
}

export interface ReadonlyCircuit {
    readonly id: GUID;
    readonly name: string;
    readonly desc: string;
    readonly thumbnail: string;

    // Queries
    pickObjAt(pt: Vector): ReadonlyObj | undefined;
    pickComponentAt(pt: Vector): ReadonlyComponent | undefined;
    pickWireAt(pt: Vector): ReadonlyWire | undefined;
    pickPortAt(pt: Vector): ReadonlyPort | undefined;

    getObj(id: GUID): ReadonlyObj | undefined;
    getComponent(id: GUID): ReadonlyComponent | undefined;
    getWire(id: GUID): ReadonlyWire | undefined;
    getPort(id: GUID): ReadonlyPort | undefined;

    getObjs(): ReadonlyObj[];
    getComponents(): ReadonlyComponent[];
    getWires(): ReadonlyWire[];

    getComponentInfo(kind: string): ComponentInfo | undefined;

    toSchema(): Schema.Circuit;
}

type C = Observable<CircuitEvent> & ReadonlyCircuit;
export interface Circuit extends C {
    beginTransaction(): void;
    commitTransaction(): void;
    cancelTransaction(): void;

    // Metadata
    readonly id: GUID;
    name: string;
    desc: string;
    thumbnail: string;

    readonly selections: Selections;

    // Queries
    pickObjAt(pt: Vector): Obj | undefined;
    pickComponentAt(pt: Vector): Component | undefined;
    pickWireAt(pt: Vector): Wire | undefined;
    pickPortAt(pt: Vector): Port | undefined;

    getObj(id: GUID): Obj | undefined;
    getComponent(id: GUID): Component | undefined;
    getWire(id: GUID): Wire | undefined;
    getPort(id: GUID): Port | undefined;

    getObjs(): Obj[];
    getComponents(): Component[];
    getWires(): Wire[];

    getComponentInfo(kind: string): ComponentInfo | undefined;

    // Object manipulation
    placeComponentAt(kind: string, pt: Vector): Component;
    // Cannot delete ports
    deleteObjs(objs: Array<Wire | Component>): void;

    importICs(ics: IntegratedCircuit[]): void;
    createIC(info: ICInfo): IntegratedCircuit;
    getICs(): IntegratedCircuit[];

    undo(): void;
    redo(): void;

    // I'm not sure if these methods makes sense to have
    // copy(): Circuit;
    // reset(): void;

    // TODO: Come up with a better name for this
    loadSchema(schema: Schema.Circuit): void;
    toSchema(): Schema.Circuit;
}

export interface ICInfo {
    circuit: ReadonlyCircuit;
    display: IntegratedCircuitDisplay;
}
export interface ICPin {
    id: GUID;  // ID of corresponding PORT
    group: string;
    pos: Vector;
}
export interface IntegratedCircuitDisplay {
    readonly size: Vector;
    readonly pins: readonly ICPin[];
}
export interface IntegratedCircuit {
    readonly id: GUID;
    readonly name: string;
    readonly desc: string;
    readonly thumbnail: string;

    readonly display: IntegratedCircuitDisplay;
    toSchema(): Schema.IntegratedCircuit;
}
