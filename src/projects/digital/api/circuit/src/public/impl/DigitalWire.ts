import {WireImpl} from "shared/api/circuit/public/impl/Wire";

import {DigitalNode}  from "../DigitalComponent";
import {DigitalPort}  from "../DigitalPort";
import {DigitalWire}  from "../DigitalWire";
import {DigitalTypes} from "./DigitalCircuitContext";


export class DigitalWireImpl extends WireImpl<DigitalTypes> implements DigitalWire {
    protected override getNodeKind(): string {
        return "DigitalNode";
    }

    protected override connectNode(node: DigitalNode, p1: DigitalPort, p2: DigitalPort) {
        const portIn = node.ports["inputs"][0], portOut = node.ports["outputs"][0];
        return {
            wire1: (p1.isOutputPort ? p1.connectTo(portIn) : p1.connectTo(portOut)),
            wire2: (p2.isOutputPort ? p2.connectTo(portIn) : p2.connectTo(portOut)),
        };
    }
}
