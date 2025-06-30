import type {Vector} from "Vector";

import type {BaseObject, ReadonlyBaseObject} from "./BaseObject";
import type {ComponentInfo} from "./ComponentInfo";
import type {Port, ReadonlyPort} from "./Port";
import type {ReadonlyWire, Wire} from "./Wire";
import type {PortConfig} from "../internal/impl/ObjInfo";

export type {PortConfig} from "../internal/impl/ObjInfo";


interface BaseReadonlyComponent<PortT, NodeT> {
    readonly baseKind: "Component";
    readonly info: ComponentInfo;

    readonly x: number;
    readonly y: number;
    readonly pos: Vector;
    readonly angle: number;
    readonly zIndex: number;

    isNode(): this is NodeT;
    isIC(): boolean;

    readonly ports: Record<string, PortT[]>;
    readonly allPorts: PortT[];

    // Do we even want this in the API?
    // readonly connectedComponents: Component[];

    firstAvailable(group: string): PortT | undefined;
}

export type ReadonlyComponent = ReadonlyBaseObject & BaseReadonlyComponent<ReadonlyPort, ReadonlyNode>;

export type Component = BaseObject & BaseReadonlyComponent<Port, Node> & {
    x: number;
    y: number;
    pos: Vector;
    angle: number;
    zIndex: number;

    shift(): void;

    setPortConfig(config: PortConfig): boolean;
    firstAvailable(group: string): Port | undefined;

    replaceWith(newKind: string): void;

    delete(): void;
}


interface BaseNode<NodeT, WireT> {
    readonly path: Array<NodeT | WireT>;
}

export type ReadonlyNode = ReadonlyComponent & BaseNode<ReadonlyNode, ReadonlyWire>;
export type Node = Component & BaseNode<Node, Wire> & {
    snip(): Wire;
}
