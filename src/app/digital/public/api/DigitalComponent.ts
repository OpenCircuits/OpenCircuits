import {Component, Node} from "core/public";

import {DigitalPort}  from "./DigitalPort";
import {APIToDigital} from "./DigitalCircuit";


export interface DigitalComponent extends APIToDigital<Component> {
    readonly firstAvailableInput: DigitalPort;
    readonly firstOutput: DigitalPort;

    isNode(): this is DigitalNode;
}

type DigitalNodeBase = (DigitalComponent & APIToDigital<Node>);
export interface DigitalNode extends DigitalNodeBase {}
