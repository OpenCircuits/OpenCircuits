import {Vector} from "Vector";

import {BaseObject, ReadonlyBaseObject} from "./BaseObject";
import {ComponentInfo} from "./ComponentInfo";
import {Port, ReadonlyPort} from "./Port";
import {Wire, ReadonlyWire} from "./Wire";
import {Schema} from "../schema";
import {PortConfig} from "../internal/impl/ObjInfo";

export type {PortConfig} from "../internal/impl/ObjInfo";


export interface ReadonlyComponent extends ReadonlyBaseObject {
    readonly baseKind: "Component";
    readonly info: ComponentInfo;

    readonly x: number;
    readonly y: number;
    readonly pos: Vector;
    readonly angle: number;

    isNode(): this is Node;

    readonly ports: Record<string, ReadonlyPort[]>;
    readonly allPorts: ReadonlyPort[];

    // Do we even want this in the API?
    // readonly connectedComponents: Component[];

    firstAvailable(group: string): ReadonlyPort | undefined;

    toSchema(): Schema.Component;
}

export interface ReadonlyNode extends ReadonlyComponent {
    readonly path: Array<ReadonlyNode | ReadonlyWire>;
}

type C = BaseObject & ReadonlyComponent;
export interface Component extends C {
    readonly baseKind: "Component";
    readonly info: ComponentInfo;

    x: number;
    y: number;
    pos: Vector;
    angle: number;

    isNode(): this is Node;

    readonly ports: Record<string, Port[]>;
    readonly allPorts: Port[];

    // Do we even want this in the API?
    // readonly connectedComponents: Component[];

    shift(): void;

    setPortConfig(config: PortConfig): boolean;
    firstAvailable(group: string): Port | undefined;

    delete(): void;

    toSchema(): Schema.Component;
}

type N = Component & ReadonlyNode;
export interface Node extends N {
    snip(): Wire;

    readonly path: Array<Node | Wire>;
}
