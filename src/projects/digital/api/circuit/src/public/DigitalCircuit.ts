import type {Vector} from "Vector";
import type {Rect}   from "math/Rect";

import type {Circuit, Component, ComponentInfo, IntegratedCircuit, Node, Port, RootCircuit, Wire} from "shared/api/circuit/public";

import type {DigitalComponentInfo}          from "./DigitalComponentInfo";
import type {DigitalComponent, DigitalNode} from "./DigitalComponent";
import type {DigitalWire}                   from "./DigitalWire";
import type {DigitalPort}                   from "./DigitalPort";


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


export interface DigitalCircuit extends APIToDigital<Circuit> {
    propagationTime: number;
}

export type DigitalRootCircuit = APIToDigital<RootCircuit> & DigitalCircuit;
export type DigitalIntegratedCircuit = APIToDigital<IntegratedCircuit> & DigitalCircuit;
