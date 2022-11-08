import {CreateGraph}  from "core/utils/ComponentUtils";
import {GetDebugInfo} from "core/utils/Debug";
import {GUID}         from "core/utils/GUID";
import {ObjSet}       from "core/utils/ObjSet";

import {AnalogComponent, AnalogNode, AnalogPort, AnalogWire, Ground} from "core/models/types/analog";

import {AnalogCircuitController} from "analog/controllers/AnalogCircuitController";

import {Netlist, NetlistAnalysis}       from "./Netlist";
import {AllNetlistInfo, GetNetlistInfo} from "./NetlistInfo";



type PathPart = AnalogWire | AnalogNode | AnalogPort; // <--- PORT !!
type Path = Set<PathPart>;


// NOTE: need to account for multiple connections from a single Port
//       which will technically be in the same Path
function GetAllPaths(circuit: AnalogCircuitController, start: AnalogWire): Path[] {
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
            if (q.kind === "AnalogPort") {
                outgoingConnected = circuit.getWiresFor(q);
                outgoingDisconnected = circuit.getSiblingPorts(q);
            } else if (q.kind === "AnalogWire") {
                const [p1, p2] = circuit.getPortsForWire(q);
                const c1 = circuit.getPortParent(p1), c2 = circuit.getPortParent(p2);

                if (c1.kind === "AnalogNode")
                    outgoingConnected.push(c1);
                else
                    outgoingConnected.push(p1);
                if (c2.kind === "AnalogNode")
                    outgoingConnected.push(c2);
                else
                    outgoingConnected.push(p2);
            } else {
                outgoingConnected = circuit.getConnectionsFor(q);
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
    pathUIDs: Map<GUID, number>;
    paths: Path[];
}


export function CircuitToNetlist(title: string, analysis: NetlistAnalysis,
                                 circuit: AnalogCircuitController): [Netlist, SimDataMappings] {
    // Get all comps, nodes, and wires
    const comps = circuit.getObjs().filter((o) => (o.baseKind === "Component")) as AnalogComponent[];
    const wires = circuit.getObjs().filter((o) => (o.baseKind === "Wire")) as AnalogWire[];
    const ports = circuit.getObjs().filter((o) => (o.baseKind === "Port")) as AnalogPort[];
    const nodes = circuit.getObjs().filter((o) => (o.kind === "AnalogNode")) as AnalogNode[];

    // Get elements, filtered by if they are valid NGSpice elements
    const elements = comps.filter((c) => (AllNetlistInfo[c.kind] !== undefined));

    // Get grounds
    const grounds = circuit.getObjs().filter((o) => (o.kind === "Ground")) as Ground[];

    const graph = CreateGraph(new ObjSet([...elements, ...nodes, ...grounds, ...wires, ...ports]));
    if (!graph.isConnected() || graph.size() <= 1) // Assume circuit is fully connected for now
        throw new Error("Cannot convert non-fully-connected circuit to a Netlist!");

    const paths = GetAllPaths(circuit, wires[0]);

    // Create unique IDs for each path to represent the node that each element
    //  is connected to since each path is electrically identical.
    // We also want to make any path that is directly connected to ground have
    //  an ID of 0 since that is how it is represented in NGSpice
    const fullPathIDs = paths.map((_, i) => i+1);
    paths.forEach((path, i) => {
        const ports = [...path.values()].filter((p) => (p.baseKind === "Port")) as AnalogPort[];
        if (ports.some((p) => (circuit.getPortParent(p).kind === "Ground")))
            fullPathIDs[i] = 0; // Whole path is connected to ground
    });

    const pathUIDs = new Map(paths.flatMap((s,i) => [...s.values()].map((val) => [val.id, fullPathIDs[i]])));

    const elementConnections = new Map<AnalogComponent, [number, number]>();
    const elementUIDs = new Map(elements.map((e, i) => [e, i]));

    elements.forEach((comp) => {
        // Assume all components have only two ports for now
        const ports = circuit.getPortsFor(comp);
        const n1 = pathUIDs.get(ports[0].id), n2 = pathUIDs.get(ports[1].id);
        if ((n1 === undefined) || (n2 === undefined))
            throw new Error(`NetlistGenerator: Failed to get path for connections for ${GetDebugInfo(comp)}!`);
        elementConnections.set(comp, [n1, n2]);
    });

    // Write each element to a Netlist line
    const netlist: Netlist = {
        title,
        elements: elements.map((e) => ({
            symbol: GetNetlistInfo(e)![0],

            uid: elementUIDs.get(e)!,

            node1: elementConnections.get(e)![0],
            node2: elementConnections.get(e)![1],

            values: GetNetlistInfo(e)![1],
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
