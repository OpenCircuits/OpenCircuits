import {useState} from "react";

import {ITEMNAV_HEIGHT, ITEMNAV_WIDTH} from "core/utils/Constants";
import {HEADER_HEIGHT}                 from "shared/utils/Constants";

import {V, Vector} from "Vector";

import {Rect, RectProps} from "math/Rect";

import {useDocEvent}       from "shared/utils/hooks/useDocEvent";
import {useMousePos}       from "shared/utils/hooks/useMousePos";
import {useSharedSelector} from "shared/utils/hooks/useShared";
import {useWindowSize}     from "shared/utils/hooks/useWindowSize";


const RESIZE_AREAS = ["center", "nw", "w", "sw", "n", "s", "ne", "e", "se"] as const;

type Corner = "nw" | "ne" | "sw" | "se";
type Edge   = "w"  | "e"  | "n"  | "s";
type ResizeArea = Edge | Corner;
type State = "none" | "center" | ResizeArea;

type Props = {
    initialWidth: number;
    initialHeight: number;

    minWidth?: number;
    minHeight?: number;

    children: React.ReactNode;
}
export const DynamicElement = ({ children, initialHeight, initialWidth, minHeight, minWidth }: Props) => {
    const { isItemNavOpen } = useSharedSelector(({ itemNav }) => ({ isItemNavOpen: itemNav.isOpen }));

    const { h, w } = useWindowSize();
    const mousePos = useMousePos();
    const [mouseDownPos, setMouseDownPos] = useState({ x: 0, y: 0 });

    const [rect, setRect] = useState<RectProps>({
        left:   (w < 768 ? 0 : w - initialWidth),
        bottom: 0,
        width:  initialWidth,
        height: initialHeight,
    });
    const [state, setState] = useState<State>("none");

    // Calculate rectangles, inner and outer to represent bounds for edges/corners
    const curRect = Rect.from(rect);
    const outerRect = new Rect(curRect.center, curRect.size.add(20));
    const innerRect = new Rect(curRect.center, curRect.size.sub(20));

    // Helper to get the "RESIZE_AREA" state using the current inner/outer rectangles
    //  for the bounds of this box, and the given position to see where we are in the box
    const GetArea = (pos: Vector) => RESIZE_AREAS[
        // Get area subsections for the center and each edge/corner
        [innerRect, ...outerRect.sub(innerRect)]
        // And find the one containing the given position
        .findIndex(a => a.contains(pos))
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

    // Bounds for the screen where the div may exist (TODO: make into a prop passed by user)
    const bounds = Rect.from({
        left:   w >= 768 ? (isItemNavOpen ? ITEMNAV_WIDTH  : 0) : 0,
        right:  w,
        bottom: w <  768 ? (isItemNavOpen ? ITEMNAV_HEIGHT : 0) : 0,
        top:    h - HEADER_HEIGHT,
    });
    // Min size of the box
    const minSize = { width: (minWidth ?? initialWidth), height: (minHeight ?? initialHeight) };

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

    return (
        <div role="menu"
             style={{
                 position: "absolute",

                 left:   newRect.left,
                 bottom: newRect.bottom,
                 width:  newRect.width,
                 height: newRect.height,

                 transition: (state === "none" ? "all 0.5s" : undefined),

                 cursor,
             }}
             onPointerDown={onMouseDown}
             onPointerUp={onMouseUp}>
            {children}
        </div>
    );
}

