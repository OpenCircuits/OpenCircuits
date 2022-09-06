import {DEFAULT_BORDER_WIDTH} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {Rect} from "math/Rect";

import {Cursor} from "core/utils/CircuitInfo";
import {Event}  from "core/utils/Events";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";

import {Oscilloscope} from "analog/models/eeobjects";


const EDGE_SIZE = DEFAULT_BORDER_WIDTH*5;

const CURSORS_MAP = ["sw", "w", "nw", "s", "n", "se", "e", "ne"].map((s) => `${s}-resize` as Cursor);

export function FindEdge({ input, camera, designer }: AnalogCircuitInfo): [undefined] | [Cursor, Vector, Oscilloscope] {
    const objs = designer.getObjects();
    const resizables = objs.filter((a) => a instanceof Oscilloscope) as Oscilloscope[];

    const worldMousePos = camera.getWorldPos(input.getMousePos());

    for (const obj of resizables) {
        const pos = obj.getPos();
        const size = obj.getSize();

        // Create slightly larger and smaller box and check
        //  if the mouse is between the two for an edge check
        const rect1 = new Rect(pos, size.add(V(EDGE_SIZE)));
        const rect2 = new Rect(pos, size.sub(V(EDGE_SIZE)));

        // Creates 8 rectangle areas
        const areas = rect1.sub(rect2);

        const areaI = areas.findIndex((a) => a.contains(worldMousePos));
        if (areaI === -1)
            continue;

        const dPos = areas[areaI].center.sub(pos);
        const dir = V(
            Math.abs(dPos.x - 0) >= 1e-4 ? Math.sign(dPos.x) : 0,
            Math.abs(dPos.y - 0) >= 1e-4 ? Math.sign(dPos.y) : 0
        );
        const cursor = CURSORS_MAP[areaI];

        return [cursor, dir, obj];
    }
    return [undefined];
}

export const CursorHandler = ({
    conditions:  (ev: Event, _: AnalogCircuitInfo) => ev.type === "mousemove",
    getResponse: (info: AnalogCircuitInfo, _: Event) => {
        const [cursor] = FindEdge(info);
        info.cursor = cursor;
    },
});
