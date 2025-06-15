import {Vector} from "Vector";
import {Rect}   from "math/Rect";

import {Component, ReadonlyComponent} from "./Component";
import {ReadonlyWire, Wire}           from "./Wire";
import {Port, ReadonlyPort}           from "./Port";
import {IntegratedCircuit}            from "./Circuit";


interface BaseReadonlyObjContainer<PortT, CompT, WireT, ICT, ObjCT> {
    // Returns the bounding box of all the objects in the container.
    readonly bounds: Rect;

    // Returns a midpoint of the set of objects based on the positions.
    readonly midpoint: Vector;

    readonly length: number;
    readonly isEmpty: boolean;

    readonly all: Array<PortT | CompT | WireT>;
    readonly components: CompT[];
    readonly wires: WireT[];
    readonly ports: PortT[];

    // Returns only the ICs that are referenced by components in this container.
    readonly ics: ICT[];

    // Returns a new ObjContainer with the wires that are connected between components in this container
    // and ports of components.
    withWiresAndPorts(): ObjCT;

    forEach(f: (obj: PortT | CompT | WireT, i: number, arr: Array<PortT | CompT | WireT>) => void): void;
    filter(f: (obj: PortT | CompT | WireT, i: number, arr: Array<PortT | CompT | WireT>) => boolean): Array<PortT | CompT | WireT>;
    filter<O extends PortT | CompT | WireT>(f: (obj: PortT | CompT | WireT, i: number, arr: Array<PortT | CompT | WireT>) => obj is O): O[];
    every(condition: (obj: PortT | CompT | WireT, i: number, arr: Array<PortT | CompT | WireT>) => boolean): boolean;
}

export type ReadonlyObjContainer = BaseReadonlyObjContainer<ReadonlyPort, ReadonlyComponent, ReadonlyWire, IntegratedCircuit, ReadonlyObjContainer>;

export type ObjContainer = BaseReadonlyObjContainer<Port, Component, Wire, IntegratedCircuit, ObjContainer> & {
    select(): void;
    shift(): void;
}
