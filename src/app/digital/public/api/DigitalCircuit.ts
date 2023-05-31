import type {Vector} from "Vector";
import type {Rect}   from "math/Rect";

import type {Circuit, Component, ComponentInfo, Node, Port, Wire} from "core/public";

import type {DigitalComponentInfo}          from "./DigitalComponentInfo";
import type {DigitalComponent, DigitalNode} from "./DigitalComponent";
import type {DigitalWire}                   from "./DigitalWire";
import type {DigitalPort}                   from "./DigitalPort";


export interface DigitalObjQuery<K extends keyof Circuit.ObjQueryTypes> extends Circuit.BaseObjQuery {
    readonly result: ToDigital<Circuit.ObjQueryTypes>[K] | undefined;
}
export interface DigitalMultiObjQuery<K extends keyof Circuit.ObjQueryTypes> extends Circuit.BaseObjQuery {
    readonly result: Array<ToDigital<Circuit.ObjQueryTypes>[K]>;
}

export type ToDigital<T> = (
    // Core types to keep the same and return early on (and prevent infinite recursion)
    T extends Vector ? Vector :
    T extends Rect   ? Rect   :
    // Base-type replacements
    T extends Circuit       ? DigitalCircuit :
    T extends Node          ? DigitalNode :
    T extends Component     ? DigitalComponent :
    T extends Wire          ? DigitalWire :
    T extends Port          ? DigitalPort :
    T extends ComponentInfo ? DigitalComponentInfo :
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
    find<K extends keyof Circuit.ObjQueryTypes>(type: K): DigitalObjQuery<K>;
    findAll<K extends keyof Circuit.ObjQueryTypes>(type: K): DigitalMultiObjQuery<K>;

    propagationTime: number;
}
