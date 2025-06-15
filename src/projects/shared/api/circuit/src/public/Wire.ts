import type {Curve} from "math/Curve";

import type {BaseObject, ReadonlyBaseObject} from "./BaseObject";
import type {Node, ReadonlyNode} from "./Component";
import type {Port, ReadonlyPort} from "./Port";
import type {Schema} from "../schema";


interface BaseReadonlyWire<PortT, NodeT, WireT> {
    readonly baseKind: "Wire";

    readonly shape: Curve;

    readonly p1: PortT;
    readonly p2: PortT;

    // TODO[model_refactor_api](leon): Maybe make some Path API object? Could be 'walkable'
    readonly path: Array<NodeT | WireT>;

    toSchema(): Schema.Wire;
}

export type ReadonlyWire = ReadonlyBaseObject & BaseReadonlyWire<ReadonlyPort, ReadonlyNode, ReadonlyWire>;

export type Wire = BaseObject & BaseReadonlyWire<Port, Node, Wire> & {
    split(): { node: Node, wire1: Wire, wire2: Wire };

    delete(): void;
}
