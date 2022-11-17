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



export const CalcMuxPortPositions = (amt: number, spacing: number, width: number, dir: Vector) => {
    return linspace((amt-1)/2*spacing, -(amt-1)/2*spacing, amt)
        .map((h, i) => CalcPortPos(V(h, ((dir.x*width/2 - 1.12) - (0.25*i)) - (Math.pow(2, amt-1)-1)/2), V(0, -0.75-0.35*(amt-i))))
};


export const CalcMuxPortPositions2 = (amt: number, spacing: number, width: number, dir: Vector) => {
    const size = V((0.5 + amt/2), (1  + Math.pow(2, amt-1)));
    const w = size.x;
    const height = size.y;
    const slope = -MULTIPLEXER_HEIGHT_OFFSET / width;
    const midPortOriginOffset = -height/2 + MULTIPLEXER_HEIGHT_OFFSET/2;

        //port.setOriginPos(V(x, y));
       // port.setTargetPos(V(x, -height/2 - IO_PORT_LENGTH));
    const pos = linspace((amt-1)/2*spacing, -(amt-1)/2*spacing, amt).map((h, i) => ({
        origin: V(h, midPortOriginOffset - slope * h),
        target: V(h, -height/2 - IO_PORT_LENGTH),
        dir: dir
    }))

    console.log(pos)
    return pos
};