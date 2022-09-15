import {HEADER_HEIGHT,
        ITEMNAV_HEIGHT,
        ITEMNAV_WIDTH} from "shared/utils/Constants";

import {Rect} from "math/Rect";

import {useSharedSelector} from "shared/utils/hooks/useShared";
import {useWindowSize}     from "shared/utils/hooks/useWindowSize";

import {useAdjustableElement} from "./useAdjustableElement";


type Props = {
    initialWidth: number;
    initialHeight: number;

    className?: string;
    style?: React.CSSProperties;

    minWidth?: number;
    minHeight?: number;

    children: React.ReactNode;
}

export const AdjustableElement = ({ className, style, initialWidth, initialHeight,
                                    minWidth, minHeight, children }: Props) => {
    const { isItemNavOpen } = useSharedSelector(({ itemNav }) => ({ isItemNavOpen: itemNav.isOpen }));

    const { w, h } = useWindowSize();

    const { cursor, newRect, state, onMouseDown, onMouseUp } = useAdjustableElement({
        left:   (w < 768 ? 0 : w - initialWidth),
        bottom: 0,
        width:  initialWidth,
        height: initialHeight,
    }, Rect.From({ // Bounds for the screen where the div may exist (TODO: make into a prop passed by user)
        left:   w >= 768 ? (isItemNavOpen ? ITEMNAV_WIDTH  : 0) : 0,
        right:  w,
        bottom: w <  768 ? (isItemNavOpen ? ITEMNAV_HEIGHT : 0) : 0,
        top:    h - HEADER_HEIGHT + 5/2,
    }), { // Min size of the box
        width:  (minWidth  ?? initialWidth),
        height: (minHeight ?? initialHeight),
    });

    return (
        <div role="menu"
             className={className}
             style={{
                 position: "absolute",

                 left:   newRect.left,
                 bottom: newRect.bottom,
                 width:  newRect.width,
                 height: newRect.height,

                 transition: (state === "none" ? "all 0.5s" : undefined),

                 cursor,

                 ...style,
             }}
             onPointerUp={onMouseUp}
             onPointerDown={(ev) => {
                // Only drag on "adjustable" parts of the element
                if (ev.target instanceof HTMLElement && "adjustable" in ev.target.dataset)
                    onMouseDown(ev);
             }}>
            {children}
        </div>
    );
}
