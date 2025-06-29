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
    ReadonlyNode,
    ReadonlyPort,
    ReadonlySelections,
    ReadonlyWire,
    Selections,
    Wire,
} from "shared/api/circuit/public";

import type {GUID, Schema} from "shared/api/circuit/schema";

import type {DigitalComponentInfo}          from "./DigitalComponentInfo";
import type {DigitalComponent, DigitalNode, ReadonlyDigitalComponent, ReadonlyDigitalNode} from "./DigitalComponent";
import type {DigitalWire, ReadonlyDigitalWire}                   from "./DigitalWire";
import type {DigitalPort, ReadonlyDigitalPort}                   from "./DigitalPort";
import type {DigitalSchema} from "digital/api/circuit/schema";
import type {ObjContainer, ReadonlyObjContainer} from "shared/api/circuit/public/ObjContainer";
import {Observable} from "shared/api/circuit/utils/Observable";


export type ToDigital<T> = (
    // Core types to keep the same and return early on (and prevent infinite recursion)
    T extends Vector ? Vector :
    T extends Rect   ? Rect   :
    // Schema-type
    T extends Schema.Circuit ? DigitalSchema.DigitalCircuit :
    // Base-type replacements
    T extends IntegratedCircuit ? DigitalIntegratedCircuit :
    T extends Circuit           ? DigitalCircuit :
    T extends Node              ? DigitalNode :
    T extends Component         ? DigitalComponent :
    T extends Wire              ? DigitalWire :
    T extends Port              ? DigitalPort :
    T extends ComponentInfo     ? DigitalComponentInfo :
    T extends ICInfo            ? DigitalICInfo :
    T extends ObjContainer      ? DigitalObjContainer :
    T extends Selections        ? DigitalSelections :
    // Base-Readonly-type replacements
    T extends ReadonlyCircuit      ? ReadonlyDigitalCircuit :
    T extends ReadonlyNode         ? ReadonlyDigitalNode :
    T extends ReadonlyComponent    ? ReadonlyDigitalComponent :
    T extends ReadonlyWire         ? ReadonlyDigitalWire :
    T extends ReadonlyPort         ? ReadonlyDigitalPort :
    T extends ReadonlyObjContainer ? ReadonlyDigitalObjContainer :
    T extends ReadonlySelections   ? ReadonlyDigitalSelections :
    // Replace all method args/return types
    T extends (...a: infer Args) => infer R ? (...a: ToDigital<Args>) => ToDigital<R> :
    // Recursively replace records
    T extends Record<string | number, unknown> ? { [key in keyof T]: ToDigital<T[key]>; } :
    // Replace arrays
    T extends unknown[] ? { [Index in keyof T]: ToDigital<T[Index]>; } :
    // Else just keep the type as it is
    T
);

export type APIToDigital<T> = {
    [key in keyof T]: ToDigital<T[key]>;
}

export type ReadonlyDigitalObjContainer = APIToDigital<ReadonlyObjContainer> & {
    readonly simState: ReadonlySimState;
}
export type DigitalObjContainer = APIToDigital<ObjContainer> & ReadonlyDigitalObjContainer;

export type ReadonlyDigitalSelections = APIToDigital<ReadonlySelections> & ReadonlyDigitalObjContainer;
export type DigitalSelections = APIToDigital<Selections> & Omit<DigitalObjContainer, "select">;

export interface ReadonlySimState {
    // PortID -> Signal
    readonly signals: Readonly<Record<GUID, DigitalSchema.Signal>>;
    // CompID -> number[]
    readonly states: Readonly<Record<GUID, number[]>>;
    // ICInstance(Comp)ID -> DigitalSimState
    readonly icStates: Readonly<Record<GUID, ReadonlySimState>>;
}
export interface ReadonlyDigitalSim extends Observable<{ type: "step" }> {
    readonly propagationTime: number;

    readonly state: ReadonlySimState;
}

export type ReadonlyDigitalCircuit = APIToDigital<ReadonlyCircuit> & {
    readonly sim: ReadonlyDigitalSim;
}

export interface DigitalSim extends ReadonlyDigitalSim {
    propagationTime: number;

    resume(): void;
    pause(): void;
    step(): void;

    sync(comps: GUID[]): void;
}

export type DigitalCircuit = APIToDigital<Circuit> & ReadonlyDigitalCircuit & {
    readonly sim: DigitalSim;
};

export type DigitalIntegratedCircuit = APIToDigital<IntegratedCircuit> & {
    readonly initialSimState: DigitalSchema.DigitalSimState;
}
export type DigitalICInfo = APIToDigital<ICInfo>;
