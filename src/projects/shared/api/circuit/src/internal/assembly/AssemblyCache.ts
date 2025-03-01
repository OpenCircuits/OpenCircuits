import {Vector} from "Vector";

import {Curve} from "math/Curve";
import {Transform}   from "math/Transform";

import {GUID}  from "..";
import {Prim} from "./Prim";


export interface PortPos {
    origin: Vector;
    target: Vector;
    dir: Vector;
}

export interface AssemblyCache {
    componentTransforms: Map<GUID, Transform>;
    componentPrims: Map<GUID, Prim[]>;

    localPortPositions: Map<GUID, PortPos>;  // Key'd by port ID
    portPositions: Map<GUID, PortPos>;       // Key'd by port ID
    portPrims: Map<GUID, Map<GUID, Prim[]>>; // Key'd by component parent, then by port ID

    wireCurves: Map<GUID, Curve>;
    wirePrims: Map<GUID, Prim[]>;
}

export type ReadonlyAssemblyCache = {
    [T in keyof AssemblyCache]: AssemblyCache[T] extends Map<infer K, infer V>
        ? ReadonlyMap<K, Readonly<V>>
        : Readonly<AssemblyCache[T]>;
}
