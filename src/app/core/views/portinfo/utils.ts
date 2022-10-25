import {V} from "Vector";

import {AnyComponent, AnyPort} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";

import {PortPos} from "./types";

import {AllPortInfo} from ".";


export function CalcPortConfigID(circuit: CircuitController, parent: AnyComponent) {
    const groups = circuit.getPortsFor(parent).map((p) => p.group);
    // Grouping IDs are comma separated strings of the number
    //  of ports in each `group` for a specific component
    return groups.reduce(
        // Count each group
        (arr, group) => [
            ...arr.slice(0, group),
            arr[group] + 1,
            ...arr.slice(group+1),
        ],
        new Array(Math.max(...groups)+1).fill(0),
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
    return config.split(",").map((a) => parseInt(a));
}

// TODO: Come up with better name, "GetPortAmount" maybe?
export function GetConfigAmount(config: string, group: number) {
    const cfg = config.split(",");
    if (group >= cfg.length)
        return 0;
    return parseInt(cfg[group]);
}
