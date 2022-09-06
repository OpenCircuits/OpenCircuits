import {CreateGraph, IOObjectSet} from "core/utils/ComponentUtils";

import {isNode} from "core/models";

import {AnalogCircuitDesigner} from "../AnalogCircuitDesigner";
import {AnalogComponent}       from "../AnalogComponent";
import {AnalogNode}            from "../AnalogNode";
import {AnalogWire}            from "../AnalogWire";
import {Ground}                from "../eeobjects";
import {AnalogPort}            from "../ports";

import {Netlist, NetlistAnalysis} from "./Netlist";


type PathPart = AnalogWire | AnalogNode | AnalogPort; // <--- PORT !!
type Path = Set<PathPart>;


// NOTE: need to account for multiple connections from a single Port
//       which will technically be in the same Path
function GetAllPaths(start: AnalogWire): Path[] {
    const paths = [] as Path[];

    const outgoingQueue = [start] as PathPart[];
    const visited = new Set<PathPart>();

    while (outgoingQueue.length > 0) {
        const q = outgoingQueue.shift()!;
        if (visited.has(q))
            continue;

        const path = new Set<PathPart>();
        const queue = [q] as PathPart[];

        while (queue.length > 0) {
            const q = queue.shift()!;

            visited.add(q);
            path.add(q);

            // Get outgoing connections
            let outgoingConnected: PathPart[] = [];
            let outgoingDisconnected: PathPart[] = [];
            if (q instanceof AnalogPort) {
                outgoingConnected = q.getWires();
                outgoingDisconnected = q.getParent().getPorts().filter((p) => p !== q);
            } else if (q instanceof AnalogWire) {
                const p1 = q.getP1Component(), p2 = q.getP2Component();

                if (isNode(p1))
                    outgoingConnected.push(p1 as AnalogNode);
                else
                    outgoingConnected.push(q.getP1() as AnalogPort);
                if (isNode(p2))
                    outgoingConnected.push(p2 as AnalogNode);
                else
                    outgoingConnected.push(q.getP2() as AnalogPort);
            } else {
                outgoingConnected = q.getConnections();
            }

            outgoingQueue.push(...outgoingDisconnected.filter((w) => !visited.has(w)));
            queue.push(...outgoingConnected.filter((w) => !visited.has(w)));
        }

        paths.push(path);
    }

    return paths;
}


export type SimDataMappings = {
    elementUIDs: Map<AnalogComponent, number>;
    elements: AnalogComponent[];
    pathUIDs: Map<PathPart, number>;
    paths: Path[];
}


export function CircuitToNetlist(title: string, analysis: NetlistAnalysis,
                                 circuit: AnalogCircuitDesigner): [Netlist, SimDataMappings] {
    // Get elements, filtered by if they are valid NGSpice elements
    const elements = circuit.getObjects().filter((a) => !!a.getNetlistSymbol());
    const nodes    = circuit.getObjects().filter((a) => a instanceof AnalogNode);
    const grounds  = circuit.getObjects().filter((a) => a instanceof Ground);
    const wires = circuit.getWires();

    const graph = CreateGraph(new IOObjectSet([...elements, ...nodes, ...grounds, ...wires]));
    if (!graph.isConnected() || graph.size() <= 1) // Assume circuit is fully connected for now
        throw new Error("Cannot convert non-fully-connected circuit to a Netlist!");

    const paths = GetAllPaths(wires[0]);

    // Create unique IDs for each path to represent the node that each element
    //  is connected to since each path is electrically identical.
    // We also want to make any path that is directly connected to ground have
    //  an ID of 0 since that is how it is represented in NGSpice
    const fullPathIDs = paths.map((_, i) => i+1);
    paths.forEach((path, i) => {
        const ports = [...path.values()].filter((p) => p instanceof AnalogPort) as AnalogPort[];
        if (ports.some((p) => p.getParent() instanceof Ground))
            fullPathIDs[i] = 0; // Whole path is connected to ground
    });

    const pathUIDs = new Map(paths.flatMap((s,i) => [...s.values()].map((val) => [val, fullPathIDs[i]])));

    const elementConnections = new Map<AnalogComponent, [number, number]>();
    const elementUIDs = new Map(elements.map((e, i) => [e, i]));

    elements.forEach((comp) => {
        // Assume all components have only two ports for now
        const n1 = pathUIDs.get(comp.getPort(0)), n2 = pathUIDs.get(comp.getPort(1));
        if ((n1 === undefined) || (n2 === undefined))
            throw new Error(`Failed to get path for connections for component: ${comp.getName()}!`);
        elementConnections.set(comp, [n1, n2]);
    });

    // Write each element to a Netlist line
    const netlist: Netlist = {
        title,
        elements: elements.map((e) => ({
            symbol: e.getNetlistSymbol()!,

            uid: elementUIDs.get(e)!,

            node1: elementConnections.get(e)![0],
            node2: elementConnections.get(e)![1],

            values: e.getNetlistValues(),
        })),
        analyses: [analysis],
    };

    return [
        netlist,
        {
            elementUIDs,
            elements,
            pathUIDs,
            paths,
        },
    ];
}
