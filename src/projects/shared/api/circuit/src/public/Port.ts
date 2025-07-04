/* eslint-disable @typescript-eslint/no-namespace */
import type {Vector} from "Vector";

import type {BaseObject, ReadonlyBaseObject}      from "./BaseObject";
import type {Component, Node, ReadonlyComponent, ReadonlyNode} from "./Component";
import type {ReadonlyWire, Wire}            from "./Wire";


interface BaseReadonlyPort<PortT, CompT, NodeT, WireT> {
    readonly baseKind: "Port";

    readonly defaultName: string | undefined;

    readonly parent: CompT;
    readonly group: string;
    readonly index: number;

    readonly originPos: Vector;
    readonly targetPos: Vector;
    readonly dir: Vector;

    readonly connections: WireT[];
    // TODO[master]: What about nodes? Should this be endpoint non-node components?
    readonly connectedPorts: PortT[];
    // TODO[master]: connectedComponents?

    // TODO[master](leon): Maybe make some Path API object? Could be 'walkable'
    readonly path: Array<NodeT | WireT>;

    // "Availability" refers to the ability to have more connections added to this port.
    readonly isAvailable: boolean;

    canConnectTo(port: PortT): boolean;
}

export type ReadonlyPort = ReadonlyBaseObject & BaseReadonlyPort<ReadonlyPort, ReadonlyComponent, ReadonlyNode, ReadonlyWire>;

export type Port = BaseObject & BaseReadonlyPort<Port, Component, Node, Wire> & {
    connectTo(other: Port): Wire | undefined;
}
