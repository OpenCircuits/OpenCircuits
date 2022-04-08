import {DEFAULT_BORDER_WIDTH} from "core/utils/Constants";

import {V} from "Vector";

import {Rect} from "math/Rect";

import {Event} from "core/utils/Events";
import {Cursor} from "core/utils/CircuitInfo";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";

import {Oscilloscope} from "analog/models/eeobjects";


export type Corner = "topleft" | "topright" | "bottomleft" | "bottomright";
export type Edge = "left" | "right" | "top" | "bottom";
export type ResizeArea = Edge | Corner;

const EDGE_SIZE = DEFAULT_BORDER_WIDTH*5;

export function FindEdge({ input, camera, designer }: AnalogCircuitInfo): [undefined] | [ResizeArea, Oscilloscope] {
    const objs = designer.getObjects();
    const resizables = objs.filter(a => a instanceof Oscilloscope) as Oscilloscope[];

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

        const areaI = areas.findIndex(a => a.contains(worldMousePos));
        if (areaI === -1)
            continue;

        const IndexMap: ResizeArea[] = [
            "bottomleft", "left", "topleft", "bottom", "top", "bottomright", "right", "topright",
        ];

        return [IndexMap[areaI], obj];
    }
    return [undefined];
}

export const AreaToCursor: Record<ResizeArea, Cursor> = {
    "left":        "w-resize",
    "right":       "e-resize",
    "top":         "n-resize",
    "bottom":      "s-resize",
    "topleft":     "nw-resize",
    "topright":    "ne-resize",
    "bottomleft":  "sw-resize",
    "bottomright": "se-resize",
};

export const CursorHandler = ({
    conditions: (ev: Event, _: AnalogCircuitInfo) => ev.type === "mousemove",
    getResponse: (info: AnalogCircuitInfo, _: Event) => {
        const [area] = FindEdge(info);
        info.cursor = area ? AreaToCursor[area] : undefined;
    },
});
