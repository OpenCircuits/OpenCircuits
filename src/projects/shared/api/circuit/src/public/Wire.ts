import type {Curve} from "math/Curve";

import type {BaseObject, ReadonlyBaseObject} from "./BaseObject";
import type {Node, ReadonlyNode} from "./Component";
import type {Port, ReadonlyPort} from "./Port";


interface BaseReadonlyWire<PortT, NodeT, WireT> {
    readonly baseKind: "Wire";

    readonly zIndex: number;
    readonly shape: Curve;

    readonly p1: PortT;
    readonly p2: PortT;

    // TODO[master](leon): Maybe make some Path API object? Could be 'walkable'
    readonly path: Array<NodeT | WireT>;
}

export type ReadonlyWire = ReadonlyBaseObject & BaseReadonlyWire<ReadonlyPort, ReadonlyNode, ReadonlyWire>;

export type Wire = BaseObject & BaseReadonlyWire<Port, Node, Wire> & {
    zIndex: number;

    shift(): void;

    split(): { node: Node, wire1: Wire, wire2: Wire };

    delete(): void;
}
