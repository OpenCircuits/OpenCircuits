import {Vector} from "Vector";

import {Rect} from "math/Rect";

import {GUID} from "shared/api/circuit/schema/GUID";

import {FastCircuitDiff} from "shared/api/circuit/internal/impl/FastCircuitDiff";

import {Component}     from "./Component";
import {ComponentInfo} from "./ComponentInfo";
import {Obj}           from "./Obj";
import {Port}          from "./Port";
import {Wire}          from "./Wire";
import {Selections}    from "./Selections";
import {Observable}    from "./Observable";


export type {CircuitMetadata} from "shared/api/circuit/schema/CircuitMetadata";

// TODO[model_refactor](leon) - make this more user friendly
export type CircuitEvent = {
    type: "change";
    diff: FastCircuitDiff;
}

export interface Circuit extends Observable<CircuitEvent> {
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
    pickObjRange(bounds: Rect): Obj[];

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

    undo(): void;
    redo(): void;

    // I'm not sure if these methods makes sense to have
    // copy(): Circuit;
    // reset(): void;

    // Figure out HOW these need to be used first before implementing
    // It might be a motivator for some Query system and then you serialize the query
    // serialize(objs?: Obj[]): string;
    // deserialize(data: string): void;
}

export interface RootCircuit extends Circuit {
    createIC(): IntegratedCircuit;
    getICs(): IntegratedCircuit[];
}

export interface IntegratedCircuitDisplay {
    size: Vector;
    setPinPos(pin: GUID, pos: Vector): void;
}
export interface IntegratedCircuit extends Circuit {
    readonly display: IntegratedCircuitDisplay;
}
