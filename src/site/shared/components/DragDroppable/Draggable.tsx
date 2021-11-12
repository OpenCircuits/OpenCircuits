import React, {useEffect, useState} from "react"

import {ESC_KEY, RIGHT_MOUSE_BUTTON} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {useDocEvent} from "shared/utils/hooks/useDocEvent";
import {useWindowKeyDownEvent} from "shared/utils/hooks/useKeyDownEvent";

import {DragDropHandlers} from "./DragDropHandlers";


type Props = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    children: React.ReactNode;
    data: any[];
    onDragChange?: (type: "start" | "end") => void;
};
export const Draggable = ({ children, data, onDragChange, ...other }: Props) => {
    const [isDragging, setIsDragging] = useState(false);

    function onDragEnd(pos: Vector) {
        if (!isDragging)
            return;
        DragDropHandlers.drop(pos, ...data);
        setIsDragging(false);
    }


    // Cancel placing when pressing escape
    useWindowKeyDownEvent(ESC_KEY, () => {
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
        if (onDragChange)
            onDragChange(isDragging ? "start" : "end");
    }, [isDragging]);

    useDocEvent(
        "mouseup",
        (ev) => onDragEnd(V(ev.clientX, ev.clientY)),
        [isDragging, ...data]
    );
    useDocEvent(
        "touchend",
        (ev) => onDragEnd(V(ev.changedTouches[0].clientX, ev.changedTouches[0].clientY)),
        [isDragging, ...data]
    );

    return <button {...other}
                   onDragStart={(ev: React.DragEvent<HTMLElement>) => ev.preventDefault() }
                   onMouseDown={() => setIsDragging(true) }
                   onTouchStart={() => setIsDragging(true) }>
        {children}
    </button>
}
