import {Vector} from "Vector";

import {GUID, Schema} from "shared/api/circuit/schema";

import {FastCircuitDiff} from "shared/api/circuit/internal/impl/FastCircuitDiff";

import {Component, ReadonlyComponent}     from "./Component";
import {ComponentInfo} from "./ComponentInfo";
import {Port, ReadonlyPort}          from "./Port";
import {ReadonlyWire, Wire}          from "./Wire";
import {ReadonlySelections, Selections}    from "./Selections";
import {Observable} from "../utils/Observable";
import {ObjContainer, ReadonlyObjContainer} from "./ObjContainer";
import {LogEntry} from "../internal/impl/CircuitLog";
import {Rect} from "math/Rect";
import {Camera, ReadonlyCamera} from "./Camera";


// TODO[master](leon) - make this more user friendly
export type CircuitEvent = {
    type: "contents";
    diff: FastCircuitDiff;
} | {
    type: "metadata";
    change: "name" | "desc";
}
export interface CircuitHistoryEvent {
    type: "change";
}
export interface CircuitHistory extends Observable<CircuitHistoryEvent> {
    getUndoStack(): readonly LogEntry[];
    getRedoStack(): readonly LogEntry[];

    clear(): void;
}
export interface ICInfo {
    circuit: ReadonlyCircuit;
    display: ReadonlyIntegratedCircuitDisplay;
}

interface BaseReadonlyCircuit<PortT, CompT, WireT, ICT, ObjCT, SelectionsT> {
    readonly id: GUID;
    readonly name: string;
    readonly desc: string;

    readonly camera: ReadonlyCamera;

    readonly history: CircuitHistory;
    readonly selections: SelectionsT;

    createContainer(objs: GUID[]): ObjCT;

    // Queries
    pickObjAt(pt: Vector): PortT | CompT | WireT | undefined;
    pickComponentAt(pt: Vector): CompT | undefined;
    pickWireAt(pt: Vector): WireT | undefined;
    pickPortAt(pt: Vector): PortT | undefined;

    pickObjsWithin(bounds: Rect): ObjCT;
    pickComponentsWithin(bounds: Rect): CompT[];
    pickPortsWithin(bounds: Rect): PortT[];

    getObj(id: GUID): PortT | CompT | WireT | undefined;
    getComponent(id: GUID): CompT | undefined;
    getWire(id: GUID): WireT | undefined;
    getPort(id: GUID): PortT | undefined;

    getObjs(): ObjCT;
    getComponents(): CompT[];
    getWires(): WireT[];

    getComponentInfo(kind: string): ComponentInfo | undefined;

    getIC(id: GUID): ICT | undefined;
    getICs(): ICT[];
}

export type ReadonlyCircuit = BaseReadonlyCircuit<ReadonlyPort, ReadonlyComponent, ReadonlyWire, IntegratedCircuit, ReadonlyObjContainer, ReadonlySelections> & Observable<CircuitEvent>;

export type Circuit = BaseReadonlyCircuit<Port, Component, Wire, IntegratedCircuit, ObjContainer, Selections> & Observable<CircuitEvent> & {
    beginTransaction(options?: { batch?: boolean }): void;
    commitTransaction(clientData?: string): void;
    cancelTransaction(): void;

    // Metadata
    name: string;
    desc: string;
    readonly camera: Camera;

    // Object manipulation
    placeComponentAt(kind: string, pt: Vector): Component;
    // Cannot delete ports
    deleteObjs(objs: Array<Wire | Component>): void;

    importICs(ics: IntegratedCircuit[]): void;
    // The ID of the IC will be randomly generated unelss `id` is specified, in which case, it will use that instead.
    createIC(info: ICInfo, id?: GUID): IntegratedCircuit;
    deleteIC(id: GUID): void;

    undo(): void;
    redo(): void;

    import(circuit: ReadonlyCircuit | ReadonlyObjContainer, opts?: { refreshIds?: boolean, loadMetadata?: boolean }): ObjContainer;
}

export interface ReadonlyICPin {
    readonly id: GUID;  // ID of corresponding PORT
    readonly group: string;

    readonly name: string;

    readonly pos: Vector;
    readonly dir: Vector;
}
export interface ICPin extends ReadonlyICPin {
    readonly id: GUID;  // ID of corresponding PORT
    readonly group: string;

    pos: Vector;
    dir: Vector;
}

export interface ReadonlyIntegratedCircuitDisplay {
    readonly size: Vector;
    readonly pins: ReadonlyICPin[];
}
export interface IntegratedCircuitDisplay extends ReadonlyIntegratedCircuitDisplay {
    size: Vector;
    readonly pins: ICPin[];
}

export interface IntegratedCircuit {
    readonly id: GUID;

    name: string;
    readonly desc: string;

    readonly display: IntegratedCircuitDisplay;

    readonly all: ReadonlyObjContainer;
    readonly components: ReadonlyComponent[];
    readonly wires: ReadonlyWire[];
}
