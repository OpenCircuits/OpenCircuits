/* eslint-disable @typescript-eslint/no-namespace */
import {Vector} from "Vector";

import {BaseObject, ReadonlyBaseObject}      from "./BaseObject";
import {Component, Node, ReadonlyComponent, ReadonlyNode} from "./Component";
import {ReadonlyWire, Wire}            from "./Wire";
import {Schema} from "../schema";


export namespace Port {
    export interface LegalWiresQuery {
        // Returns true if the given port has available space for more wires
        readonly isWireable: boolean;

        // Returns true if the given port can wire to the given `port`.
        contains(port: Port): boolean;
    }
}

export interface ReadonlyPort extends ReadonlyBaseObject {
    readonly baseKind: "Port";

    readonly parent: ReadonlyComponent;
    readonly group: string;
    readonly index: number;

    readonly originPos: Vector;
    readonly targetPos: Vector;
    readonly dir: Vector;

    readonly connections: ReadonlyWire[];
    // TODO[model_refactor_api]: What about nodes? Should this be endpoint non-node components?
    readonly connectedPorts: ReadonlyPort[];
    // TODO[model_refactor_api]: connectedComponents?

    // TODO[model_refactor_api](leon): Maybe make some Path API object? Could be 'walkable'
    readonly path: Array<ReadonlyNode | ReadonlyWire>;

    getLegalWires(): Port.LegalWiresQuery;

    toSchema(): Schema.Port;
}

type P = BaseObject & ReadonlyPort;
export interface Port extends P {
    readonly baseKind: "Port";

    readonly parent: Component;
    readonly group: string;
    readonly index: number;

    readonly originPos: Vector;
    readonly targetPos: Vector;
    readonly dir: Vector;

    readonly connections: Wire[];
    // TODO[model_refactor_api]: What about nodes? Should this be endpoint non-node components?
    readonly connectedPorts: Port[];
    // TODO[model_refactor_api]: connectedComponents?

    // TODO[model_refactor_api](leon): Maybe make some Path API object? Could be 'walkable'
    readonly path: Array<Node | Wire>;

    getLegalWires(): Port.LegalWiresQuery;
    connectTo(other: Port): Wire | undefined;

    toSchema(): Schema.Port;
}
