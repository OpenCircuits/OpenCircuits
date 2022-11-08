import {Graph} from "math/Graph";

import {AnyComponent, AnyNode, AnyObj, AnyPort, AnyWire} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";

import {GUID}   from "./GUID";
import {ObjSet} from "./ObjSet";


/**
 * Gets all the wires/WirePorts going out from this wire
 *  Note: this path is UN-ORDERED!
 *
 * @param circuit The circuit.
 * @param w       The wire to start from.
 * @param full    True if you want to return everything in the circuit otherwise returns
 *                only the wires/nodes connected to the wire.
 * @returns       The array of wires/WirePorts in this path (including w).
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
 *                returns only the wires/nodes connected to the selected wire.
 * @returns       An array of connections + WirePorts.
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

/**
 * Helper function to create a directed graph from a given
 *  collection of components.
 *
 * The Graph stores Nodes as their UUIDs and Edges by their UUID.
 *
 * @param groups            The SeparatedComponentCollection of components.
 * @param groups.components The components from the ObjSet.
 * @param groups.wires      The wires from the ObjSet.
 * @param groups.ports      The ports from the ObjSet.
 * @returns                 A graph corresponding to the given circuit.
 */
 export function CreateGraph({ components, ports, wires }: ObjSet): Graph<GUID, GUID> {
    const graph = new Graph<GUID, GUID>();

    // Create nodes which are all components and ports
    components.forEach((c) => graph.createNode(c.id));
    ports.forEach((p) => graph.createNode(p.id));

    // Create edges which are the connections between ports and the connections from ports to their parents
    ports.forEach((p) => graph.createEdge(p.parent, p.id, p.id));
    wires.forEach((w) => graph.createEdge(w.p1, w.p2, w.id));

    return graph;
}
