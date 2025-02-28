/* eslint-disable @typescript-eslint/no-namespace */
import {Vector} from "Vector";

import {BaseObject}      from "./BaseObject";
import {Component, Node} from "./Component";
import {Wire}            from "./Wire";


export namespace Port {
    export interface LegalWiresQuery {
        // Returns true if the given port has available space for more wires
        readonly isWireable: boolean;

        // Returns true if the given port can wire to the given `port`.
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
    // TODO[model_refactor_api]: What about nodes? Should this be endpoint non-node components?
    readonly connectedPorts: Port[];
    // TODO[model_refactor_api]: connectedComponents?

    // TODO[model_refactor_api](leon): Maybe make some Path API object? Could be 'walkable'
    readonly path: Array<Node | Wire>;

    getLegalWires(): Port.LegalWiresQuery;
    connectTo(other: Port): Wire | undefined;
}
