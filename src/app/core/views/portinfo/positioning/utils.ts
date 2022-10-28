import {IO_PORT_LENGTH} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {linspace} from "math/MathUtils";


export const CalcPortPos = (origin: Vector, dir: Vector) =>  ({
    origin,
    target: origin.add(dir.scale(IO_PORT_LENGTH)),
    dir,
});

export const CalcPortPositions = (amt: number, spacing: number, width: number, dir: Vector) => (
    linspace((amt-1)/2*spacing, -(amt-1)/2*spacing, amt)
        .map((h) => CalcPortPos(V(dir.x*width/2, h), dir))
);
