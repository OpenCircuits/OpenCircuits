import {DEFAULT_BORDER_WIDTH, IO_PORT_LENGTH} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {linspace} from "math/MathUtils";


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

export const CalcQuadCurvePortPositions = (amt: number, width: number, spacing: number, dir: Vector) => (
    linspace((amt-1)/2*spacing, -(amt-1)/2*spacing, amt)
        .map((h) => CalcQuadCurvePortPos(V(dir.x*width/2, h), dir, V(1.2, 1)))
);


export const CalcPortPositions = (amt: number, spacing: number, width: number, dir: Vector) => (
    linspace((amt-1)/2*spacing, -(amt-1)/2*spacing, amt)
        .map((h) => CalcPortPos(V(dir.x*width/2, h), dir))
);
