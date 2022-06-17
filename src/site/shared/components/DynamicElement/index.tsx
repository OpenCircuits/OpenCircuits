import {useEffect, useLayoutEffect, useMemo, useState} from "react";

import {V, Vector} from "Vector";

import {Rect} from "math/Rect";

import {useDocEvent}   from "shared/utils/hooks/useDocEvent";
import {useMousePos}   from "shared/utils/hooks/useMousePos";
import {useWindowSize} from "shared/utils/hooks/useWindowSize";


export type Corner = "nw" | "ne" | "sw" | "se";
export type Edge = "w" | "e" | "n" | "s";
export type ResizeArea = Edge | Corner;

const RESIZE_AREAS = ["center", "nw", "w", "sw", "n", "s", "ne", "e", "se"] as const;


type State = "none" | "center" | ResizeArea;

type Props = {
    initialWidth: number;
    initialHeight: number;

    minWidth?: number;
    minHeight?: number;

    children: React.ReactNode;
}
export const DynamicElement = ({ initialHeight, initialWidth, minHeight, minWidth, children }: Props) => {
    const [rect, setRect] = useState({ left: 0, bottom: 0, right: initialWidth, top: initialHeight });
    const [state, setState] = useState<State>("none");

    const curRect = Rect.from(rect);
    const outerRect = new Rect(curRect.center, curRect.size.add(20));
    const innerRect = new Rect(curRect.center, curRect.size.sub(20));

    const { h, w } = useWindowSize();
    const mousePos = useMousePos();
    const [mouseDownPos, setMouseDownPos] = useState({ x: 0, y: 0 });

    const GetArea = (pos: Vector) => RESIZE_AREAS[
        // Get area subsections for the center and each edge/corner
        [innerRect, ...outerRect.sub(innerRect)]
        // And find the one containing the given position
        .findIndex(a => a.contains(pos))
    ];

    const onMouseDown = (ev: React.PointerEvent) => {
        // Ignore non-LMB for mouse events
        if (ev.button !== 0)
            return;

        const mousePos = { x: ev.pageX, y: ev.pageY };

        setMouseDownPos({ ...mousePos });

        const area = GetArea(V(mousePos.x, h - mousePos.y));
        if (!area)
            throw new Error("Failed to find area that cursor is within in DynamicElement!");
        setState(area);
    }
    const onMouseUp = () => {
        setRect({ ...newRect });
        setState("none");
    }

    useDocEvent("pointerup", onMouseUp);
    useDocEvent("pointerleave", onMouseUp);

    const newRect = (() => {
        if (state === "none")
            return curRect;

        const dMousePos = V(mousePos.x - mouseDownPos.x, -(mousePos.y - mouseDownPos.y));

        // Simply move the box if we're in the center area
        if (state === "center")
            return new Rect(curRect.center.add(dMousePos), curRect.size);

        // Get direction to shift in based on n/w/e/s directions
        const dir = V(
            (state.includes("w") ? -1 : (state.includes("e") ? +1 : 0)),
            (state.includes("s") ? -1 : (state.includes("n") ? +1 : 0)),
        );

        // Shift each x/y direction separately so that corners work as expected
        const shiftX = dMousePos.dot(V(dir.x, 0));
        const shiftY = dMousePos.dot(V(0, dir.y));

        return curRect.shift(dir, V(shiftX, shiftY), {
            minSize: {
                width:  minWidth  ?? initialWidth,
                height: minHeight ?? initialHeight,
            },
        });
    })();

    const area = GetArea(V(mousePos.x, h - mousePos.y));
    const cursor = (!area || area === "center") ? (undefined) : (`${area}-resize`);

    return (
        <div role="section"
             style={{
                 position: "absolute",

                 left:   newRect.left,
                 bottom: newRect.bottom,
                 width:  newRect.width,
                 height: newRect.height,

                 cursor,
             }}
             onPointerDown={onMouseDown}
             onPointerUp={onMouseUp}
             onPointerCancel={onMouseUp}>
            {children}
        </div>
    );
}

