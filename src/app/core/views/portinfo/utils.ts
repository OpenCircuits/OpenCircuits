import {V} from "Vector";

import {AnyComponent, AnyPort} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";

import {PortPos} from "./types";

import {AllPortInfo} from ".";


export function CalcPortConfigID(circuit: CircuitController, parent: AnyComponent) {
    const ports = circuit.getPortsFor(parent);
    // Grouping IDs are comma separated strings of the number
    //  of ports in each `group` for a specific component
    return ports.reduce(
        // Count each group
        (arr, { group }) => {
            arr[group] = ((arr[group] ?? 0) + 1);
            return arr;
        },
        [] as number[]
    ).join(",");
}

export function GetPortPos(circuit: CircuitController, port: AnyPort): PortPos {
    const parent = circuit.getPortParent(port);
    const grouping = CalcPortConfigID(circuit, parent);
    return AllPortInfo[parent.kind].Positions[grouping][`${port.group}:${port.index}`];
}

export function GetPortWorldPos(circuit: CircuitController, port: AnyPort): PortPos {
    const parent = circuit.getPortParent(port);
    const { origin, target, dir } = GetPortPos(circuit, port);
    return {
        origin: origin.rotate(parent.angle).add(V(parent.x, parent.y)),
        target: target.rotate(parent.angle).add(V(parent.x, parent.y)),
        dir:    dir.rotate(parent.angle),
    };
}

export function ParseConfig(config: string) {
    return config.split(",").map((a) => parseInt(a)).map((v) => (isNaN(v) ? 0 : v));
}

// TODO: Come up with better name, "GetPortAmount" maybe?
export function GetConfigAmount(config: string, group: number) {
    const val = parseInt(config.split(",")[group]);
    return (isNaN(val) ? 0 : val);
}
