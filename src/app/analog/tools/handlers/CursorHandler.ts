import {DEFAULT_BORDER_WIDTH} from "core/utils/Constants";

import {V} from "Vector";

import {RectContains} from "math/MathUtils";
import {Transform} from "math/Transform";

import {Event} from "core/utils/Events";
import {Cursor} from "core/utils/CircuitInfo";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";

import {Oscilloscope} from "analog/models/eeobjects";


export type Edge = "horizontal" | "vertical" | "none";

const EDGE_SIZE = DEFAULT_BORDER_WIDTH*5;

export function FindEdge({ input, camera, designer }: AnalogCircuitInfo): ["none"] | [Edge, Oscilloscope] {
    const objs = designer.getObjects();
    const resizables = objs.filter(a => a instanceof Oscilloscope) as Oscilloscope[];

    for (const obj of resizables) {
        const pos = obj.getPos();
        const size = obj.getSize();

        // Create slightly larger and smaller box and check
        //  if the mouse is between the two for an edge check
        const t1 = new Transform(pos, size.add(V(EDGE_SIZE)));
        const t2 = new Transform(pos, size.sub(V(EDGE_SIZE)));

        const worldMousePos = camera.getWorldPos(input.getMousePos());
        if (!(RectContains(t1, worldMousePos) && !RectContains(t2, worldMousePos)))
            continue;

        // Determine if mouse is over horizontal or vertical edge
        const edge = (worldMousePos.y < pos.y + size.y/2 - EDGE_SIZE/2 &&
                      worldMousePos.y > pos.y - size.y/2 + EDGE_SIZE/2) ? "horizontal" : "vertical";
        return [edge, obj];
    }
    return ["none"];
}

export const EdgeToCursor: Record<Edge, Cursor> = {
    "none": "default",
    "horizontal": "ew-resize",
    "vertical": "ns-resize",
};

export const CursorHandler = ({
    conditions: (ev: Event, _: AnalogCircuitInfo) => ev.type === "mousemove",
    getResponse: (info: AnalogCircuitInfo, _: Event) => {
        const [edge] = FindEdge(info);
        info.cursor = EdgeToCursor[edge];
    },
});
