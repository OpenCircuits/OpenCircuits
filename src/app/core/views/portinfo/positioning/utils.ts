import {IO_PORT_LENGTH, MULTIPLEXER_HEIGHT_OFFSET} from "core/utils/Constants";

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

export const CalcMuxSelectPortPositions = (isMultiplexer:boolean, amt: number, spacing: number, dir: Vector) => {
    const size = V((0.5 + amt/2), (1  + Math.pow(2, amt-1)));
    const height = size.y;
    const midPortOriginOffset = -height/2 + MULTIPLEXER_HEIGHT_OFFSET/2;

    const end = V(size.x/2, -size.y/2 + MULTIPLEXER_HEIGHT_OFFSET);
    const start = V(-size.x/2, -size.y/2);
    const slope = (isMultiplexer ? -1 : 1) * (end.y - start.y)/(end.x - start.x)

    return linspace((amt-1)/2*spacing, -(amt-1)/2*spacing, amt).map((h, i) => ({
        origin: V(h, midPortOriginOffset - slope * h),
        target: V(h, -height/2 - IO_PORT_LENGTH),
        dir: dir
    }))
};

export const CalcMuxIOPortPositions = (isMultiplexer:boolean, amt:number) => {
    const muxTypeFactor = isMultiplexer ? -1 : 1;
    const size = V((0.5 + amt/2), (1 + Math.pow(2, amt - 1)));
    const x = muxTypeFactor * size.x / 2;
    const ports = [];
    const outputs = Math.pow(2,amt);
    for (let i = 0; i < outputs; i++) {
        const midpoint = (outputs-1)/2;
        const spacingPos = 1/2 * (i-midpoint);
        const y = -spacingPos + 1/4;
        ports[i] = {
            origin: V(x, y),
            target: V(x + muxTypeFactor * IO_PORT_LENGTH, y),
            dir: V(muxTypeFactor, 0)
        }
    }

    return ports;
}