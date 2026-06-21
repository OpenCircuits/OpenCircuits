import {AnalysisInfo} from "analog/api/circuit/public";
import {CircuitInternal} from "shared/api/circuit/internal";
import {Schema} from "shared/api/circuit/schema";
import {Netlist} from "./Netlist";

type PathPart = Schema.Wire | Schema.Component | Schema.Port;
type Path = Set<PathPart>;

function GetAllPaths(start: Schema.Wire, circuit: CircuitInternal): Path[] {
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
            const current = queue.shift()!;

            visited.add(current);
            path.add(current);

            // Get outgoing connections
            let outgoingConnected: PathPart[] = [];
            let outgoingDisconnected: PathPart[] = [];
            
            if (current.baseKind === "Port") {
                outgoingConnected = [...circuit.getWiresForPort(current.id).unwrap()].map(id => circuit.getWireByID(id).unwrap());
                // Get all other ports on the same component (this logic connects disjoint ports for paths)
                outgoingDisconnected = [...circuit.getPortsForComponent(current.parent).unwrap()]
                    .filter(pid => pid !== current.id)
                    .map(pid => circuit.getPortByID(pid).unwrap());
            } else if (current.baseKind === "Wire") {
                const p1 = circuit.getPortByID(current.p1).unwrap();
                const p2 = circuit.getPortByID(current.p2).unwrap();

                const comp1 = circuit.getCompByID(p1.parent).unwrap();
                if (comp1.kind === "AnalogNode")
                    outgoingConnected.push(comp1);
                else
                    outgoingConnected.push(p1);

                const comp2 = circuit.getCompByID(p2.parent).unwrap();
                if (comp2.kind === "AnalogNode")
                    outgoingConnected.push(comp2);
                else
                    outgoingConnected.push(p2);
            } else if (current.baseKind === "Component" && current.kind === "AnalogNode") {
                const ports = [...circuit.getPortsForComponent(current.id).unwrap()].map(id => circuit.getPortByID(id).unwrap());
                outgoingConnected = ports.flatMap(p => [...circuit.getWiresForPort(p.id).unwrap()].map(id => circuit.getWireByID(id).unwrap()));
            }

            outgoingQueue.push(...outgoingDisconnected.filter((w) => !visited.has(w)));
            queue.push(...outgoingConnected.filter((w) => !visited.has(w)));
        }

        paths.push(path);
    }

    return paths;
}

export type SimDataMappings = {
    elementUIDs: Map<Schema.Component, number>;
    elements: Schema.Component[];
    pathUIDs: Map<PathPart, number>;
    paths: Path[];
}

const KindToNetlistSymbol: Record<string, string> = {
    "Capacitor": "C",
    "Inductor": "L",
    "Resistor": "R",
    "CurrentSource": "I",
    "VoltageSource": "V",
}

function GetNetlistValues(comp: Schema.Component): string[] {
    switch (comp.kind) {
        case "Resistor":  return [`${comp.props.R ?? 100}${comp.props.unit ?? ""}`];
        case "Capacitor": return [`${comp.props.C ?? 1}${comp.props.unit ?? ""}`];
        case "Inductor":  return [`${comp.props.L ?? 1}${comp.props.unit ?? ""}`];
        case "VoltageSource": {
            if (comp.props.waveform === "sin") {
                return ["SIN", `(${comp.props.v1 ?? 0}${comp.props.v1Unit ?? ""} ${comp.props.V ?? 5}${comp.props.VUnit ?? ""} ${comp.props.f ?? 1}${comp.props.fUnit ?? ""} ${comp.props.td ?? 0}${comp.props.tdUnit ?? ""} ${comp.props.d ?? 0} ${comp.props.ph ?? 0})`];
            } else if (comp.props.waveform === "pulse") {
                return ["PULSE", `(${comp.props.v1 ?? 0}${comp.props.v1Unit ?? ""} ${comp.props.V ?? 5}${comp.props.VUnit ?? ""} ${comp.props.td ?? 0}${comp.props.tdUnit ?? ""} ${comp.props.tr ?? 0}${comp.props.trUnit ?? ""} ${comp.props.tf ?? 0}${comp.props.tfUnit ?? ""} ${comp.props.pw ?? 0}${comp.props.pwUnit ?? ""} ${comp.props.p ?? 0}${comp.props.pUnit ?? ""})`];
            }
            return ["DC", `${comp.props.V ?? 5}${comp.props.VUnit ?? ""}`];
        }
        case "CurrentSource": return ["DC", `${comp.props.c ?? 1}${comp.props.cUnit ?? ""}`];
    }
    return [];
}

export function CircuitToNetlist(title: string, analysis: AnalysisInfo,
                                 circuit: CircuitInternal): [Netlist, SimDataMappings] {
    const comps = [...circuit.getComps()].map((id) => circuit.getCompByID(id).unwrap());
    const elements = comps.filter((c) => (c.kind in KindToNetlistSymbol));
    const wires = [...circuit.getWires()].map((id) => circuit.getWireByID(id).unwrap());

    if (wires.length === 0)
        throw new Error("Cannot convert empty circuit to a Netlist!");

    const paths = GetAllPaths(wires[0], circuit);

    const fullPathIDs = paths.map((_, i) => i+1);
    paths.forEach((path, i) => {
        const ports = [...path.values()].filter((p) => p.baseKind === "Port") as Schema.Port[];
        if (ports.some((p) => circuit.getCompByID(p.parent).unwrap().kind === "Ground"))
            fullPathIDs[i] = 0; // Ground
    });

    if (!fullPathIDs.includes(0))
        throw new Error("Circuit must contain at least one Ground node!");

    const pathUIDs = new Map(paths.flatMap((s,i) => [...s.values()].map((val) => [val, fullPathIDs[i]])));

    const elementConnections = new Map<Schema.Component, [number, number]>();
    const elementUIDs = new Map(elements.map((e, i) => [e, i]));

    elements.forEach((comp) => {
        const ports = [...circuit.getPortsForComponent(comp.id).unwrap()].map(id => circuit.getPortByID(id).unwrap());
        const n1 = pathUIDs.get(ports[0]), n2 = pathUIDs.get(ports[1]);
        if ((n1 === undefined) || (n2 === undefined))
            throw new Error(`Failed to get path for connections for component: ${comp.id}!`);
        elementConnections.set(comp, [n1, n2]);
    });

    const netlist: Netlist = {
        title,
        elements: elements.map((e) => ({
            symbol: KindToNetlistSymbol[e.kind] as any,
            uid: elementUIDs.get(e)!.toString(),
            node1: elementConnections.get(e)![0].toString(),
            node2: elementConnections.get(e)![1].toString(),
            values: GetNetlistValues(e),
        })),
        analyses: [analysis as any],
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