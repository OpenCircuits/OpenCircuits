import React, {useCallback, useEffect, useState} from "react"

import {DRAG_TIME, RIGHT_MOUSE_BUTTON} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {useDocEvent}           from "shared/utils/hooks/useDocEvent";
import {useWindowKeyDownEvent} from "shared/utils/hooks/useKeyDownEvent";

import {DragDropHandlers} from "./DragDropHandlers";


type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
type Props<D extends unknown[]> = ButtonProps & {
    children: React.ReactNode;
    data: D;
    dragDir: "horizontal" | "vertical";
    onDragChange?: (type: "start" | "end") => void;
};
export const Draggable = <D extends unknown[]>({ children, data, dragDir, onDragChange, ...other }: Props<D>) => {
    const [isDragging, setIsDragging] = useState(false);

    // State to keep track of when to "start" dragging for a mobile touch-down
    //  This is necessary so that if a user tries to scroll on a Draggable
    //   they have a tiny amount of time before it starts dragging so they can swipe
    //  Also keep track of starting position so we can determine direction of movement
    const [state, setState] = useState({
        startTapTime: 0, startX: 0, startY: 0, touchDown: false,
    });

    const onDragEnd = useCallback((pos: Vector) => {
        if (!isDragging)
            return;
        DragDropHandlers.drop(pos, ...data);
        setIsDragging(false);
    }, [isDragging, data, setIsDragging]);

    // Cancel placing when pressing escape
    useWindowKeyDownEvent("Escape", () => {
        setIsDragging(false);
    });

    // Also cancel on Right Click
    useDocEvent("mouseup", (ev) => {
        if (isDragging && ev.button === RIGHT_MOUSE_BUTTON) {
            setIsDragging(false);
            ev.preventDefault();
            ev.stopPropagation();
        }
        // v-- Essentially increases priority for this event so we can cancel the context menu
    }, [isDragging], true);

    useEffect(() => {
        onDragChange?.(isDragging ? "start" : "end");
    }, [isDragging, onDragChange]);

    useDocEvent(
        "mouseup",
        (ev) => onDragEnd(V(ev.clientX, ev.clientY)),
        [isDragging, ...data, onDragEnd]
    );

    return (
        <button
            type="button"
            {...other}
            onDragStart={(ev: React.DragEvent<HTMLElement>) => ev.preventDefault()}
            onMouseDown={(_) => {
                if (!state.touchDown)
                    setIsDragging(true);
            }}
            // This is necessary for mobile such that when the user is trying to
            //  swipe to scroll, it doesn't drag too quickly
            onTouchStart={(e) => {
                const { clientX: x, clientY: y } = e.touches.item(0);
                setState({ startTapTime: Date.now(), startX: x, startY: y, touchDown: true });
            }}
            onTouchMove={(e) => {
                const { startTapTime, startX, startY, touchDown } = state;
                const { clientX: x, clientY: y } = e.touches.item(0);
                const vx = (x - startX), vy = (y - startY);
                const dt = (Date.now() - startTapTime);

                // Wait to check for a drag
                if (touchDown && dt > DRAG_TIME) {
                    // Make sure it's being dragged in correct direction
                    const dir = (Math.abs(vy) > Math.abs(vx)) ? "vertical" : "horizontal";
                    if (dir === dragDir) { // Check for correct direction
                        setIsDragging(true);
                        setState({ startTapTime: 0, startX: 0, startY: 0, touchDown: false });
                    } else if (dt > 4*DRAG_TIME) {
                        // If waited *too* long, then we're probably not dragging, move on
                        setState({ startTapTime: 0, startX: 0, startY: 0, touchDown: false });
                    }
                }
            }}
            onTouchEnd={(ev) => {
                onDragEnd(V(ev.changedTouches[0].clientX, ev.changedTouches[0].clientY));
                other.onTouchEnd?.(ev);
            }}>
            {children}
        </button>
    );
}
