import type {Vector} from "Vector";
import type {Rect}   from "math/Rect";

import type {
    Circuit,
    Component,
    ComponentInfo,
    ICInfo,
    IntegratedCircuit,
    Node,
    Port,
    ReadonlyCircuit,
    ReadonlyComponent,
    ReadonlyIntegratedCircuit,
    ReadonlyNode,
    ReadonlyPort,
    ReadonlySelections,
    ReadonlyWire,
    Selections,
    Wire,
} from "shared/api/circuit/public";

import type {GUID} from "shared/api/circuit/schema";

import type {DigitalComponentInfo}          from "./DigitalComponentInfo";
import type {DigitalComponent, DigitalNode, ReadonlyDigitalComponent, ReadonlyDigitalNode} from "./DigitalComponent";
import type {DigitalWire, ReadonlyDigitalWire}                   from "./DigitalWire";
import type {DigitalPort, ReadonlyDigitalPort}                   from "./DigitalPort";
import type {DigitalSchema} from "digital/api/circuit/schema";
import type {ObjContainer, ReadonlyObjContainer} from "shared/api/circuit/public/ObjContainer";
import {Observable} from "shared/api/circuit/utils/Observable";
import {CircuitAPITypes} from "shared/api/circuit/public/impl/CircuitContext";


export type ReplaceAPITypes<T, Types extends CircuitAPITypes> = (
    // Core types to keep the same and return early on (and prevent infinite recursion)
    T extends Vector ? Vector :
    T extends Rect   ? Rect   :
    // Base-type replacements
    T extends IntegratedCircuit ? Types["IntegratedCircuitT"] :
    T extends Circuit           ? Types["CircuitT"]           :
    T extends Node              ? Types["NodeT"]              :
    T extends Component         ? Types["ComponentT"]         :
    T extends Wire              ? Types["WireT"]              :
    T extends Port              ? Types["PortT"]              :
    T extends ObjContainer      ? Types["ObjContainerT"]      :
    T extends Selections        ? Types["SelectionsT"]        :
    T extends ComponentInfo     ? Types["ComponentInfoT"]     :
    T extends ICInfo            ? Types["ICInfoT"]            :
    // Base-Readonly-type replacements
    T extends ReadonlyIntegratedCircuit ? Types["ReadonlyIntegratedCircuitT"] :
    T extends ReadonlyCircuit           ? Types["ReadonlyCircuitT"]           :
    T extends ReadonlyNode              ? Types["ReadonlyNodeT"]              :
    T extends ReadonlyComponent         ? Types["ReadonlyComponentT"]         :
    T extends ReadonlyWire              ? Types["ReadonlyWireT"]              :
    T extends ReadonlyPort              ? Types["ReadonlyPortT"]              :
    T extends ReadonlyObjContainer      ? Types["ReadonlyObjContainerT"]      :
    T extends ReadonlySelections        ? Types["ReadonlySelectionsT"]        :
    // Replace all method args/return types
    T extends (...a: infer Args) => infer R ? (...a: ReplaceAPITypes<Args, Types>) => ReplaceAPITypes<R, Types> :
    // Recursively replace records
    T extends Record<string | number, unknown> ? { [key in keyof T]: ReplaceAPITypes<T[key], Types>; } :
    // Replace arrays
    T extends unknown[] ? { [Index in keyof T]: ReplaceAPITypes<T[Index], Types>; } :
    // Else just keep the type as it is
    T
);

export type DigitalAPITypes = {
    CircuitT: DigitalCircuit;
    ReadonlyCircuitT: ReadonlyDigitalCircuit;

    IntegratedCircuitT: DigitalIntegratedCircuit;
    ReadonlyIntegratedCircuitT: ReadonlyDigitalIntegratedCircuit;

    NodeT: DigitalNode;
    ReadonlyNodeT: ReadonlyDigitalNode;

    ComponentT: DigitalComponent;
    ReadonlyComponentT: ReadonlyDigitalComponent;

    WireT: DigitalWire;
    ReadonlyWireT: ReadonlyDigitalWire;

    PortT: DigitalPort;
    ReadonlyPortT: ReadonlyDigitalPort;

    ObjContainerT: DigitalObjContainer;
    ReadonlyObjContainerT: ReadonlyDigitalObjContainer;

    SelectionsT: DigitalSelections;
    ReadonlySelectionsT: ReadonlyDigitalSelections;

    ComponentInfoT: DigitalComponentInfo;
    ICInfoT: DigitalICInfo;
}

export type ToDigital<T> = ReplaceAPITypes<T, DigitalAPITypes>;

export type APIToDigital<T> = {
    [key in keyof T]: ToDigital<T[key]>;
}

export type ReadonlyDigitalObjContainer = APIToDigital<ReadonlyObjContainer> & {
    readonly simState: ReadonlySimState;
}
export type DigitalObjContainer = APIToDigital<ObjContainer> & ReadonlyDigitalObjContainer;

export type ReadonlyDigitalSelections = APIToDigital<ReadonlySelections> & ReadonlyDigitalObjContainer;
export type DigitalSelections = APIToDigital<Selections> &  APIToDigital<Omit<ObjContainer, "select">> & ReadonlyDigitalObjContainer;

export interface ReadonlySimState {
    // PortID -> Signal
    readonly signals: Readonly<Record<GUID, DigitalSchema.Signal>>;
    // CompID -> number[]
    readonly states: Readonly<Record<GUID, number[]>>;
    // ICInstance(Comp)ID -> DigitalSimState
    readonly icStates: Readonly<Record<GUID, ReadonlySimState>>;
}
export type DigitalSimEv = {
    type: "step";
} | {
    type: "pause";
} | {
    type: "resume";
} | {
    type: "propagationTimeChanged";
    newTime: number;
}
export interface ReadonlyDigitalSim extends Observable<DigitalSimEv> {
    readonly propagationTime: number;
    readonly isPaused: boolean;

    readonly state: ReadonlySimState;
}
export interface DigitalSim extends ReadonlyDigitalSim {
    propagationTime: number;

    resume(): void;
    pause(): void;
    step(): void;

    sync(comps: GUID[]): void;
}

export type ReadonlyDigitalCircuit = APIToDigital<ReadonlyCircuit> & {
    readonly sim: ReadonlyDigitalSim;
}

export type DigitalCircuit = APIToDigital<Circuit> & ReadonlyDigitalCircuit & {
    readonly sim: DigitalSim;
};

export type ReadonlyDigitalIntegratedCircuit = APIToDigital<ReadonlyIntegratedCircuit> & {
    readonly initialSimState: Readonly<DigitalSchema.DigitalSimState>;
}
export type DigitalIntegratedCircuit = APIToDigital<IntegratedCircuit> & {
    readonly initialSimState: DigitalSchema.DigitalSimState;
}
export type DigitalICInfo = APIToDigital<ICInfo>;
