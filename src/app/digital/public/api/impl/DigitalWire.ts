import {WireImpl} from "core/public/api/impl/Wire";

import {DigitalComponent} from "../DigitalComponent";
import {DigitalPort}      from "../DigitalPort";
import {DigitalWire}      from "../DigitalWire";

import {DigitalCircuitState} from "./DigitalCircuitState";


export class DigitalWireImpl extends WireImpl<
    DigitalComponent, DigitalWire, DigitalPort, DigitalCircuitState
> implements DigitalWire {
    protected override get nodeKind() {
        return "DigitalNode";
    }

    protected override connectNode(
        p1: DigitalPort,
        p2: DigitalPort,
        node: DigitalComponent
    ): { wire1: DigitalWire, wire2: DigitalWire } {
        const nodeIn = node.ports["inputs"][0], nodeOut = node.ports["outputs"][0];

        const wire1 = (p1.isOutputPort ? p1.connectTo(nodeIn) : p1.connectTo(nodeOut));
        const wire2 = (p2.isOutputPort ? p2.connectTo(nodeIn) : p2.connectTo(nodeOut));

        if (!wire1)
            throw new Error(`Failed to connect p1 to node! ${p1} -> ${node}`);
        if (!wire2)
            throw new Error(`Failed to connect p2 to node! ${p2} -> ${node}`);

        return { wire1, wire2 };
    }
}
