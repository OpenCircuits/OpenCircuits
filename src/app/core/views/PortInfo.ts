import {IO_PORT_LENGTH} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {linspace} from "math/MathUtils";

import {AnyComponent} from "core/models/types";


// export const PortInfo: Record<AnyComponent["kind"],

type PortPos = { origin: Vector, target: Vector }

const CalcPortPos = (origin: Vector, dir: Vector) =>  ({ origin, target: origin.add(dir.scale(IO_PORT_LENGTH)) });

const CalcPortPositions = (amt: number, spacing: number) => (
    linspace(-amt/2*spacing/2, +amt/2*spacing/2, amt)
        .map((h) => CalcPortPos(V(-0.5, h), V(-1, 0)))
);

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
