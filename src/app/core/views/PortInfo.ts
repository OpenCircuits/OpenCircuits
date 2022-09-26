import {IO_PORT_LENGTH} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {linspace} from "math/MathUtils";

import {AnyComponent, AnyObj, AnyPort} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";


export type PortPos = { origin: Vector, target: Vector, dir: Vector };

export function CalcPortConfigID(circuit: CircuitController<AnyObj>, parent: AnyComponent) {
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

export function GetPortPos(circuit: CircuitController<AnyObj>, port: AnyPort): PortPos {
    const parent = circuit.getPortParent(port);
    const grouping = CalcPortConfigID(circuit, parent);
    return PortInfo[parent.kind][grouping][`${port.group}:${port.index}`];
}

export function GetPortWorldPos(circuit: CircuitController<AnyObj>, port: AnyPort): PortPos {
    const parent = circuit.getPortParent(port);
    const { origin, target, dir } = GetPortPos(circuit, port);
    return {
        origin: origin.rotate(parent.angle).add(V(parent.x, parent.y)),
        target: target.rotate(parent.angle).add(V(parent.x, parent.y)),
        dir:    dir.rotate(parent.angle),
    };
}

const CalcPortPos = (origin: Vector, dir: Vector) =>  ({
    origin,
    target: origin.add(dir.scale(IO_PORT_LENGTH)),
    dir,
});

const CalcPortPositions = (amt: number, spacing: number) => (
    linspace(-amt/2*spacing/2, +amt/2*spacing/2, amt)
        .map((h) => CalcPortPos(V(-0.5, h), V(-1, 0)))
);

export const PortInfo: Record<AnyComponent["kind"], Record<string, Record<`${number}:${number}`, PortPos>>> = {
    "DigitalNode": {
        "1,1": {
            "0:0": { origin: V(0, 0), target: V(0, 0), dir: V(-1, 0) },
            "1:0": { origin: V(0, 0), target: V(0, 0), dir: V(1, 0) },
        },
    },
    "ANDGate": {
        // "Config"
        "2,1": {
            "0:0": CalcPortPositions(2, 0.5)[0],
            "0:1": CalcPortPositions(2, 0.5)[1],
            "1:0": CalcPortPos(V(0.5, 0), V(1, 0)),
        },
        "3,1": {
            "0:0": CalcPortPositions(3, 0.5)[0],
            "0:1": CalcPortPositions(3, 0.5)[1],
            "0:2": CalcPortPositions(3, 0.5)[2],
            "1:0": CalcPortPos(V(0.5, 0), V(1, 0)),
        },
    },
};

// This is a list of all components that have more than one port configuration
//  implying that the user should have the option of changing them.
export const CHANGEABLE_PORT_COMPONENTS = Object.keys(PortInfo)
    .filter((key: keyof typeof PortInfo) => Object.keys(PortInfo[key]).length > 1);
