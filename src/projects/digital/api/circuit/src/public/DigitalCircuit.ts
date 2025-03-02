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
    ReadonlyWire,
    RootCircuit,
    Wire,
} from "shared/api/circuit/public";

import type {DigitalComponentInfo}          from "./DigitalComponentInfo";
import type {DigitalComponent, DigitalNode, ReadonlyDigitalComponent, ReadonlyDigitalNode} from "./DigitalComponent";
import type {DigitalWire, ReadonlyDigitalWire}                   from "./DigitalWire";
import type {DigitalPort, ReadonlyDigitalPort}                   from "./DigitalPort";


export type ToDigital<T> = (
    // Core types to keep the same and return early on (and prevent infinite recursion)
    T extends Vector ? Vector :
    T extends Rect   ? Rect   :
    // Base-type replacements
    T extends IntegratedCircuit ? DigitalIntegratedCircuit :
    T extends Circuit           ? DigitalCircuit :
    T extends Node              ? DigitalNode :
    T extends Component         ? DigitalComponent :
    T extends Wire              ? DigitalWire :
    T extends Port              ? DigitalPort :
    T extends ComponentInfo     ? DigitalComponentInfo :
    T extends ICInfo            ? DigitalICInfo :
    // Base-Readonly-type replacements
    T extends ReadonlyCircuit   ? ReadonlyDigitalCircuit :
    T extends ReadonlyNode      ? ReadonlyDigitalNode :
    T extends ReadonlyComponent ? ReadonlyDigitalComponent :
    T extends ReadonlyWire      ? ReadonlyDigitalWire :
    T extends ReadonlyPort      ? ReadonlyDigitalPort :
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


export interface ReadonlyDigitalCircuit extends APIToDigital<ReadonlyCircuit> {
    readonly propagationTime: number;
}
type C = APIToDigital<Circuit> & ReadonlyDigitalCircuit;
export interface DigitalCircuit extends C {
    propagationTime: number;
}

export type DigitalRootCircuit = APIToDigital<RootCircuit> & DigitalCircuit;
export type DigitalIntegratedCircuit = APIToDigital<IntegratedCircuit> & ReadonlyDigitalCircuit;
export type DigitalICInfo = APIToDigital<ICInfo>;
