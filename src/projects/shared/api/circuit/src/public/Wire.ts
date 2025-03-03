import {Curve} from "math/Curve";

import {BaseObject, ReadonlyBaseObject} from "./BaseObject";
import {Node, ReadonlyNode} from "./Component";
import {Port, ReadonlyPort} from "./Port";
import {Schema} from "../schema";


export interface ReadonlyWire extends ReadonlyBaseObject {
    readonly baseKind: "Wire";

    readonly shape: Curve;

    readonly p1: ReadonlyPort;
    readonly p2: ReadonlyPort;

    // TODO[model_refactor_api](leon): Maybe make some Path API object? Could be 'walkable'
    readonly path: Array<ReadonlyNode | ReadonlyWire>;

    toSchema(): Schema.Wire;
}

type W = BaseObject & ReadonlyWire;
export interface Wire extends W {
    readonly baseKind: "Wire";

    readonly shape: Curve;

    readonly p1: Port;
    readonly p2: Port;

    // TODO[model_refactor_api](leon): Maybe make some Path API object? Could be 'walkable'
    readonly path: Array<Node | Wire>;

    split(): { node: Node, wire1: Wire, wire2: Wire };

    delete(): void;

    toSchema(): Schema.Wire;
}
