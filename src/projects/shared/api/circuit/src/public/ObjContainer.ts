import {Vector} from "Vector";
import {Rect}   from "math/Rect";

import {Component}  from "./Component";
import {Obj}        from "./Obj";
import {Wire}       from "./Wire";
import {Port}       from "./Port";
import {IntegratedCircuit} from "./Circuit";


export interface ObjContainer {
    // Returns the bounding box of all the objects in the container.
    readonly bounds: Rect;

    // Returns a midpoint of the set of objects based on the positions.
    readonly midpoint: Vector;

    readonly length: number;
    readonly isEmpty: boolean;

    readonly all: Obj[];
    readonly components: Component[];
    readonly wires: Wire[];
    readonly ports: Port[];

    // Returns only the ICs that are referenced by components in this container.
    readonly ics: IntegratedCircuit[];

    // Returns a new ObjContainer with the wires that are connected between components in this container
    // and ports of components.
    withWiresAndPorts(): ObjContainer;

    shift(): void;

    forEach(f: (obj: Obj, i: number, arr: Obj[]) => void): void;
    filter(f: (obj: Obj, i: number, arr: Obj[]) => boolean): Obj[];
    filter<O extends Obj>(f: (obj: Obj, i: number, arr: Obj[]) => obj is O): O[];
    every(condition: (obj: Obj, i: number, arr: Obj[]) => boolean): boolean;
}
