import {DEFAULT_BORDER_WIDTH, IO_PORT_LENGTH} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {linspace, linspaceDX} from "math/MathUtils";

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

export function ParseConfig(config: string) {
    return config.split(",").map((a) => parseInt(a)).map((v) => (isNaN(v) ? 0 : v));
}

// TODO: Come up with better name, "GetPortAmount" maybe?
export function GetConfigAmount(config: string, group: number) {
    const val = parseInt(config.split(",")[group]);
    return (isNaN(val) ? 0 : val);
}

const CalcPortPos = (origin: Vector, dir: Vector) =>  ({
    origin,
    target: origin.add(dir.scale(IO_PORT_LENGTH)),
    dir,
});

const CalcPortPositions = (amt: number, spacing: number) => (
    linspace(-(amt-1)/2*spacing, +(amt-1)/2*spacing, amt)
        .map((h) => CalcPortPos(V(-0.5, h), V(-1, 0)))
);


type Positioner = (amt: number) => PortPos[];

const GenConfig = (groupInfo: Record<number, { amt: number, calcPos: Positioner }>) => {
    const groups = Object.keys(groupInfo).map((v) => parseInt(v)).sort();

    // Generate comma separated config ID
    const configID = (() => {
        const g = new Array(Math.max(...groups));
        groups.forEach((v) => (g[v] = groupInfo[v].amt));
        return g.join(",");
    })();

    return {
        [configID]: Object.fromEntries(
            // Go through each group
            groups.flatMap((group) => (
                // And then calculate the position at each index
                groupInfo[group].calcPos(groupInfo[group].amt)
                    // And then map it with its associated ID
                    .map((p, index) => [`${group}:${index}`, p] as const)
            ))
        ) as Record<`${number}:${number}`, PortPos>,
    }
}

const GenPortInfo = (N: number, groupInfo: Record<number, PortPos | { amts: number[], calcPos: Positioner }>) => (
    new Array(N).fill(0)
        .reduce((prev, _, i) => {
            const newGroupInfo = Object.fromEntries(
                Object.entries(groupInfo)
                    .map(([group, info]) => {
                        if ("amts" in info)
                            return [group, { amt: info.amts[i], calcPos: info.calcPos }] as const;
                        // Single PortPos means it's only always a single port
                        return [group, { amt: 1, calcPos: () => [info] }];
                    })
            );

            const config = GenConfig(newGroupInfo);

            return { ...prev, ...config };
        }, {}) as Record<string, Record<`${number}:${number}`, PortPos>>
);

export const PortInfo: Record<AnyComponent["kind"], Record<string, Record<`${number}:${number}`, PortPos>>> = {
    "DigitalNode": {
        "1,1": {
            "0:0": { origin: V(0, 0), target: V(0, 0), dir: V(-1, 0) },
            "1:0": { origin: V(0, 0), target: V(0, 0), dir: V(+1, 0) },
        },
    },
    "AnalogNode": {
        "1,1": {
            "0:0": { origin: V(0, 0), target: V(0, 0), dir: V(-1, 0) },
            "1:0": { origin: V(0, 0), target: V(0, 0), dir: V(+1, 0) },
        },
    },
    "ANDGate": GenPortInfo(7, {
        0: {
            amts:    linspaceDX(2,9,1),
            calcPos: (amt) => CalcPortPositions(amt, 0.5 - DEFAULT_BORDER_WIDTH/2),
        },
        1: CalcPortPos(V(0.5, 0), V(1, 0)),
    }),
    "Resistor": {
        "1,1": {
            "0:0": { origin: V(-0.6, 0), target: V(-1, 0), dir: V(-1, 0) },
            "1:0": { origin: V(+0.6, 0), target: V(+1, 0), dir: V(+1, 0) },
        },
    },
};

// This is a list of all components that have more than one port configuration
//  implying that the user should have the option of changing them.
export const CHANGEABLE_PORT_COMPONENTS = Object.keys(PortInfo)
    .filter((key: keyof typeof PortInfo) => Object.keys(PortInfo[key]).length > 1);
