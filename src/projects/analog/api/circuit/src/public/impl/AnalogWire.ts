import {Node, Port} from "shared/api/circuit/public";
import {CircuitTypes} from "shared/api/circuit/public/impl/CircuitState";
import {WireImpl} from "shared/api/circuit/public/impl/Wire";


export class AnalogWireImpl extends WireImpl<CircuitTypes> {
    protected override getNodeKind(): string {
        return "AnalogNode";
    }

    protected override connectNode(node: Node, p1: Port, p2: Port) {
        const port = node.ports[""][0];
        return {
            wire1: p1.connectTo(port),
            wire2: port.connectTo(p2),
        };
    }
}
