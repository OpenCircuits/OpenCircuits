import {Graph}   from "math/Graph";
import {Circuit} from "../public/Circuit";

/**
 * This function converts the provided circuit to a graph where the nodes are components and edges are wires.
 * Both are represented by guids rather than object references.
 *
 * @param circuit The circuit to convert to a graph.
 * @returns       The provided circuit as a graph.
 */
export function CreateGraph(circuit: Circuit): Graph<string, string> {
    const graph = new Graph<string, string>();

    const objs = circuit.getComponents();
    for (const obj of objs) {
        graph.createNode(obj.id);
    }
    const wires = circuit.getWires();
    for (const wire of wires) {
        graph.createEdge(wire.p1.parent.id, wire.p2.parent.id, wire.id);
    }

    return graph;
}
