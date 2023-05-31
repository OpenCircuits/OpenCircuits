import {WireImpl} from "core/public/api/impl/Wire";

import {GUID} from "core/internal";

import {extend} from "core/utils/Functions";

import {DigitalCircuit} from "../DigitalCircuit";
import {DigitalNode}    from "../DigitalComponent";
import {DigitalWire}    from "../DigitalWire";

import {DigitalCircuitState, DigitalTypes} from "./DigitalCircuitState";


export function DigitalWireImpl(circuit: DigitalCircuit, state: DigitalCircuitState, id: GUID) {
    const base = WireImpl<DigitalTypes>(circuit, state, id, (p1, p2, pos) => {
        const node = circuit.placeComponentAt(pos, "DigitalNode") as DigitalNode;

        const nodeIn = node.ports["inputs"][0], nodeOut = node.ports["outputs"][0];

        const wire1 = (p1.isOutputPort ? p1.connectTo(nodeIn) : p1.connectTo(nodeOut));
        const wire2 = (p2.isOutputPort ? p2.connectTo(nodeIn) : p2.connectTo(nodeOut));

        if (!wire1)
            throw new Error(`Failed to connect p1 to node! ${p1} -> ${node}`);
        if (!wire2)
            throw new Error(`Failed to connect p2 to node! ${p2} -> ${node}`);

        return { node, wire1, wire2 };
    });

    return extend(base, {} as const) satisfies DigitalWire;
}
