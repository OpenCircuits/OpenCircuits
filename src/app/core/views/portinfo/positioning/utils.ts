import {DEFAULT_BORDER_WIDTH, IO_PORT_LENGTH} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {linspace} from "math/MathUtils";

import {PortPos} from "../types";
import { PortView } from "core/views/PortView";


export const CalcPortPos = (origin: Vector, dir: Vector) =>  ({
    origin,
    target: origin.add(dir.scale(IO_PORT_LENGTH)),
    dir,
});

export const CalcQuadCurvePortPos = (origin: Vector, dir: Vector, size: Vector) => {
    let t = ((origin.y) / size.y + 0.5) % 1;
    if (t < 0)
        t += 1;

    // @TODO move to a MathUtils QuadCurve function or something
    const s = size.x/2 - DEFAULT_BORDER_WIDTH;
    const l = size.x/5 - DEFAULT_BORDER_WIDTH;
    const t2 = 1 - t;

    // Calculate x position along quadratic curve
    const x = (t2*t2)*(-s) + 2*t*(t2)*(-l) + (t*t)*(-s);
    return {
        origin: V(x, origin.y),
        target: origin.add(dir.scale(IO_PORT_LENGTH)),
        dir,
    }
};

export const CalcPortPositions = (amt: number, spacing: number) => (
    linspace(-(amt-1)/2*spacing, +(amt-1)/2*spacing, amt)
        .map((h) => CalcPortPos(V(-0.5, h), V(-1, 0)))
);

export const CalcQuadCurvePortPositions = (amt: number, spacing: number) => (
    linspace((amt-1)/2*spacing, -(amt-1)/2*spacing, amt)
        .map((h) => CalcQuadCurvePortPos(V(-.6, h), V(-1, 0), V(1.2, 1)))
);



export type Positioner = (amt: number) => PortPos[];

export const GenConfig = (groupInfo: Record<number, { amt: number, calcPos: Positioner }>) => {
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

export const GenPortInfo = (
    N: number,
    groupInfo: Record<number, PortPos | { amts: number[], calcPos: Positioner }>
) => (
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
