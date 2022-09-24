import {IO_PORT_LENGTH} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {linspace} from "math/MathUtils";

import {AnyComponent, AnyObj, AnyPort} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";


// export const PortInfo: Record<AnyComponent["kind"],

export type PortPos = { origin: Vector, target: Vector }

const CalcPortPos = (origin: Vector, dir: Vector) =>  ({ origin, target: origin.add(dir.scale(IO_PORT_LENGTH)) });

const CalcPortPositions = (amt: number, spacing: number) => (
    linspace(-amt/2*spacing/2, +amt/2*spacing/2, amt)
        .map((h) => CalcPortPos(V(-0.5, h), V(-1, 0)))
);

export function CalcPortGroupingID(circuit: CircuitController<AnyObj>, port: AnyPort) {
    const parent = circuit.getPortParent(port);
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

export function GetPortPos(circuit: CircuitController<AnyObj>, port: AnyPort) {
    const parent = circuit.getPortParent(port);
    const grouping = CalcPortGroupingID(circuit, port);
    return PortInfo[parent.kind][grouping][`${port.group}:${port.index}`];
}

export function GetPortWorldPos(circuit: CircuitController<AnyObj>, port: AnyPort) {
    const parent = circuit.getPortParent(port);
    const pos = GetPortPos(circuit, port);
    return {
        origin: pos.origin.rotate(parent.angle).add(V(parent.x, parent.y)),
        target: pos.target.rotate(parent.angle).add(V(parent.x, parent.y)),
    };
}

export const PortInfo: Record<AnyComponent["kind"], Record<string, Record<`${number}:${number}`, PortPos>>> = {
    "ANDGate": {
        // "Grouping"
        "2,1": {
            "0:0": CalcPortPositions(2, 0.5)[0],
            "0:1": CalcPortPositions(2, 0.5)[1],
            "1:0": CalcPortPos(V(0.5, 0), V(1, 0)),
        },
    },
};

// export const PortInfo: Record<AnyComponent["kind"], Array<[PortPos[], PortPos[], PortPos[]]>> = {
//     "ANDGate": [
//         [CalcPortPositions(2, 0.5), [CalcPortPos(V(0.5, 0), V(1, 0))], []],
//     ],
// };
