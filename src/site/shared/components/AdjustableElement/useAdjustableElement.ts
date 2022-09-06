import {useState} from "react";

import {V, Vector} from "Vector";

import {Rect, RectProps} from "math/Rect";

import {useDocEvent}   from "shared/utils/hooks/useDocEvent";
import {useMousePos}   from "shared/utils/hooks/useMousePos";
import {useWindowSize} from "shared/utils/hooks/useWindowSize";


const RESIZE_AREAS = ["center", "nw", "w", "sw", "n", "s", "ne", "e", "se"] as const;

type Corner = "nw" | "ne" | "sw" | "se";
type Edge   = "w"  | "e"  | "n"  | "s";
type ResizeArea = Edge | Corner;

type State = "none" | "center" | ResizeArea;

export const useAdjustableElement = (initialRect: RectProps, bounds: Rect,
                                     minSize: { width: number, height: number }) => {
    const { h } = useWindowSize();
    const mousePos = useMousePos();
    const [mouseDownPos, setMouseDownPos] = useState({ x: 0, y: 0 });

    const [rect, setRect] = useState<RectProps>(initialRect);
    const [state, setState] = useState<State>("none");

    // Calculate rectangles, inner and outer to represent bounds for edges/corners
    const curRect = Rect.From(rect);
    const outerRect = new Rect(curRect.center, curRect.size.add(20));
    const innerRect = new Rect(curRect.center, curRect.size.sub(20));

    // Helper to get the "RESIZE_AREA" state using the current inner/outer rectangles
    //  for the bounds of this box, and the given position to see where we are in the box
    const GetArea = (pos: Vector) => RESIZE_AREAS[
        // Get area subsections for the center and each edge/corner
        [innerRect, ...outerRect.sub(innerRect)]
        // And find the one containing the given position
        .findIndex((a) => a.contains(pos))
    ];

    const onMouseDown = ({ button, pageX: x, pageY: y }: React.PointerEvent) => {
        // Ignore non-LMB for mouse events
        if (button !== 0)
            return;
        // If undefined, lag probably happened, so just ignore this case
        setState(GetArea(V(x, h - y)) ?? "none");
        setMouseDownPos({ x, y });
    }
    const onMouseUp = () => {
        // Set current rect to the newRect and reset state
        setRect({ ...newRect });
        setState("none");
    }

    useDocEvent("pointerup", onMouseUp);
    useDocEvent("pointerleave", onMouseUp);

    // Calculate new rect based on current mouse position and if we're
    //  currently resizing/moving the container
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
        return curRect.shift(dir, dMousePos.scale(dir), { minSize, bounds });
    })();

    // Clamp between the bounds of the screen
    newRect.clamp(bounds);

    const area = GetArea(V(mousePos.x, h - mousePos.y));
    const cursor = (!area) ? (undefined) : ((area === "center") ? ("grab") : (`${area}-resize`));

    return {
        cursor,
        newRect,
        state,
        onMouseDown,
        onMouseUp,
    };
}
