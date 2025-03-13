import {Vector} from "Vector";

import {WireImpl} from "shared/api/circuit/public/impl/Wire";

import {DigitalWire}  from "../DigitalWire";
import {DigitalPort}  from "../DigitalPort";
import {DigitalTypes} from "./DigitalCircuitState";


export class DigitalWireImpl extends WireImpl<DigitalTypes> implements DigitalWire {
    protected override connectNode(p1: DigitalPort, p2: DigitalPort, pos: Vector) {
        const info = this.state.internal.getComponentInfo("DigitalNode").unwrap();
        const nodeId = this.state.internal.placeComponent("DigitalNode", { x: pos.x, y: pos.y }).unwrap();
        this.state.internal.setPortConfig(nodeId, info!.defaultPortConfig).unwrap();

        const node = this.state.constructComponent(nodeId);
        if (!node.isNode())
            throw new Error(`Failed to construct node when splitting! Id: ${nodeId}`);

        const portIn = node.ports["inputs"][0], portOut = node.ports["outputs"][0];

        const wire1 = (p1.isOutputPort ? p1.connectTo(portIn) : p1.connectTo(portOut));
        const wire2 = (p2.isOutputPort ? p2.connectTo(portIn) : p2.connectTo(portOut));

        if (!wire1)
            throw new Error(`Failed to connect p1 to node! ${p1} -> ${node}`);
        if (!wire2)
            throw new Error(`Failed to connect p2 to node! ${p2} -> ${node}`);

        return { node, wire1, wire2 };
    }
}
