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
import {ObjContainer} from "./ObjContainer";


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

    createContainer(objs: GUID[]): ObjContainer;

    // Object manipulation
    placeComponentAt(kind: string, pt: Vector): Component;
    // Cannot delete ports
    deleteObjs(objs: Array<Wire | Component>): void;

    importICs(ics: IntegratedCircuit[]): void;
    createIC(info: ICInfo): IntegratedCircuit;
    deleteIC(id: GUID): void;
    getIC(id: GUID): IntegratedCircuit | undefined;
    getICs(): IntegratedCircuit[];

    undo(): void;
    redo(): void;

    history: {
        // TODO: Get the current history?
        clear(): void;
    };

    // I'm not sure if these methods makes sense to have
    // copy(): Circuit;
    // reset(): void;

    // TODO: Come up with a better name for this
    loadSchema(schema: Schema.Circuit, refreshIds?: boolean): Obj[];
    toSchema(): Schema.Circuit;
}


export interface ReadonlyICPin {
    readonly id: GUID;  // ID of corresponding PORT
    readonly group: string;

    readonly pos: Vector;
    readonly dir: Vector;
}
export interface ReadonlyIntegratedCircuitDisplay {
    readonly size: Vector;
    readonly pins: ReadonlyICPin[];
}

export interface ICPin extends ReadonlyICPin {
    readonly id: GUID;  // ID of corresponding PORT
    readonly group: string;

    pos: Vector;
    dir: Vector;
}
export interface IntegratedCircuitDisplay extends ReadonlyIntegratedCircuitDisplay {
    size: Vector;
    readonly pins: ICPin[];
}

export interface ICInfo {
    circuit: ReadonlyCircuit;
    display: ReadonlyIntegratedCircuitDisplay;
}
export interface IntegratedCircuit {
    readonly id: GUID;

    name: string;
    readonly desc: string;
    readonly thumbnail: string;

    readonly display: IntegratedCircuitDisplay;
    toSchema(): Schema.IntegratedCircuit;
}
