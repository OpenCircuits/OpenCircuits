import {Component, Node, ReadonlyComponent, ReadonlyNode} from "shared/api/circuit/public";

import {DigitalPort}  from "./DigitalPort";
import {APIToDigital} from "./DigitalCircuit";


export interface ReadonlyDigitalComponent extends APIToDigital<ReadonlyComponent> {
    readonly inputs: DigitalPort[];
    readonly outputs: DigitalPort[];

    isNode(): this is DigitalNode;
}
type C = APIToDigital<Component> & ReadonlyDigitalComponent;
export interface DigitalComponent extends C {
    readonly inputs: DigitalPort[];
    readonly outputs: DigitalPort[];

    isNode(): this is DigitalNode;
}

type ReadonlyDigitalNodeBase = (APIToDigital<ReadonlyNode> & ReadonlyDigitalComponent);
export interface ReadonlyDigitalNode extends ReadonlyDigitalNodeBase {}
type DigitalNodeBase = (APIToDigital<Node> & DigitalComponent & ReadonlyDigitalNode);
export interface DigitalNode extends DigitalNodeBase {}
