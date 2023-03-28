/* eslint-disable @typescript-eslint/no-namespace */

import {Vector}     from "Vector";
import {BaseObject} from "./BaseObject";
import {Component}  from "./Component";
import {Wire}       from "./Wire";


export namespace Port {
    export interface LegalWiresQuery {
        readonly isEmpty: boolean;

        contains(port: Port): boolean;
    }
}

export interface Port extends BaseObject {
    readonly baseKind: "Port";

    readonly parent: Component;
    readonly group: string;
    readonly index: number;

    readonly originPos: Vector;
    readonly targetPos: Vector;
    readonly dir: Vector;

    readonly connections: Wire[];
    readonly connectedPorts: Port[]; // TODO: think of a better name for this ?

    getLegalWires(): Port.LegalWiresQuery;
    connectTo(other: Port): void;
}
