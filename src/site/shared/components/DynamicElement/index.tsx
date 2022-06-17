import {ITEMNAV_HEIGHT, ITEMNAV_WIDTH} from "core/utils/Constants";
import {HEADER_HEIGHT}                 from "shared/utils/Constants";

import {Rect} from "math/Rect";

import {useSharedSelector} from "shared/utils/hooks/useShared";
import {useWindowSize}     from "shared/utils/hooks/useWindowSize";

import {useDynamicElement} from "./useDynamicElement";


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

    const { cursor, newRect, state, onMouseDown, onMouseUp } = useDynamicElement({
        left:   (w < 768 ? 0 : w - initialWidth),
        bottom: 0,
        width:  initialWidth,
        height: initialHeight,
    }, Rect.from({ // Bounds for the screen where the div may exist (TODO: make into a prop passed by user)
        left:   w >= 768 ? (isItemNavOpen ? ITEMNAV_WIDTH  : 0) : 0,
        right:  w,
        bottom: w <  768 ? (isItemNavOpen ? ITEMNAV_HEIGHT : 0) : 0,
        top:    h - HEADER_HEIGHT,
    }), { // Min size of the box
        width:  (minWidth  ?? initialWidth),
        height: (minHeight ?? initialHeight),
    });

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
