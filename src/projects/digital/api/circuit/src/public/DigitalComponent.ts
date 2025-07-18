import {Component, Node, ReadonlyComponent, ReadonlyNode} from "shared/api/circuit/public";

import {DigitalPort, ReadonlyDigitalPort}  from "./DigitalPort";
import {APIToDigital} from "./DigitalCircuit";


interface BaseReadonlyDigitalComponent<P, N> {
    readonly inputs: P[];
    readonly outputs: P[];

    isNode(): this is N;
}

export type ReadonlyDigitalComponent = APIToDigital<ReadonlyComponent> &
    BaseReadonlyDigitalComponent<ReadonlyDigitalPort, ReadonlyDigitalNode>;


export type DigitalComponent = APIToDigital<Component> &
    BaseReadonlyDigitalComponent<DigitalPort, DigitalNode> & {

    setSimState(state?: number[]): void;
}


type ReadonlyDigitalNodeBase = (APIToDigital<ReadonlyNode> & ReadonlyDigitalComponent);
export interface ReadonlyDigitalNode extends ReadonlyDigitalNodeBase {}
type DigitalNodeBase = (APIToDigital<Node> & DigitalComponent & ReadonlyDigitalNode);
export interface DigitalNode extends DigitalNodeBase {}
