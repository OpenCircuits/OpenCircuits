import {AnyComponent, AnyNode, AnyObj, AnyPort, AnyWire} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";


/**
 * Gets all the wires/WirePorts going out from this wire
 *  Note: this path is UN-ORDERED!
 *
 * @param circuit The circuit.
 * @param w       The wire to start from.
 * @param full    True if you want to return everything in the circuit otherwise returns
 *          only the wires/nodes connected to the wire.
 * @returns         The array of wires/WirePorts in this path (including w).
 */
 export function GetPath(
    circuit: CircuitController<AnyObj>,
    w: AnyWire | AnyNode,
    full = true,
): Array<AnyWire | AnyNode> {
    const path: Array<AnyWire | AnyNode> = [];

    // Breadth First Search
    const queue = new Array<AnyWire | AnyNode>(w);
    const visited = new Set<AnyWire | AnyNode>();

    while (queue.length > 0) {
        const q = queue.shift()!;

        visited.add(q);
        path.push(q);
        if (q.baseKind === "Wire") {
            if (full) {
                const p1 = circuit.getPortParent(circuit.getObj(q.p1) as AnyPort);
                if ((p1.kind === circuit.getNodeKind()) && !visited.has(p1))
                    queue.push(p1);
            }
            const p2 = circuit.getPortParent(circuit.getObj(q.p2) as AnyPort);
            if ((p2.kind === circuit.getNodeKind()) && !visited.has(p2))
                queue.push(p2);
        } else {
            // Push all of the Node's connecting wires, filtered by if they've been visited
            queue.push(
                ...circuit.getPortsFor(q)
                    .flatMap((p) => circuit.getWiresFor(p))
                    .filter((w) => !visited.has(w))
            );
        }
    }

    return path;
}

/**
 * Gathers all wires + wireports in the path from the inputs/outputs
 *  of the given component.
 *
 * @param circuit The circuit.
 * @param obj     The component.
 * @param full    True if you want to return everything in the circuit otherwise
 *          returns only the wires/nodes connected to the selected wire.
 * @returns         An array of connections + WirePorts.
 */
export function GetAllPaths(
    circuit: CircuitController<AnyObj>,
    obj: AnyComponent,
    full = true,
): Array<AnyWire | AnyNode> {
    // Get all distinct connections
    const wires = [...new Set(
        circuit.getPortsFor(obj)
            .flatMap((p) => circuit.getWiresFor(p))
    )];

    // Get all distinct paths
    return [...new Set(wires.flatMap((w) => GetPath(circuit, w, full)))];

}
