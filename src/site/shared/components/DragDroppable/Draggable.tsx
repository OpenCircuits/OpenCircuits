import React, {useEffect, useState} from "react"
import {useDocEvent} from "shared/utils/hooks/useDocEvent";
import {V, Vector} from "Vector";

import {DragDropHandlers} from "./DragDropHandlers";


type Props = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    children: React.ReactNode;
    data: any[];
    onDragChange?: (type: "start" | "end") => void;
};
export const Draggable = ({ children, data, onDragChange, ...other }: Props) => {
    const [isDragging, setIsDragging] = useState(false);

    // console.log(`i has data: ${data}`);
    function onDragEnd(pos: Vector) {
        if (!isDragging)
            return;
        DragDropHandlers.drop(pos, ...data);
        setIsDragging(false);
    }

    useEffect(() => {
        if (onDragChange)
            onDragChange(isDragging ? "start" : "end");
    }, [isDragging]);

    useDocEvent(
        "mouseup",
        (ev) => onDragEnd(V(ev.clientX, ev.clientY)),
        [isDragging, setIsDragging, ...data]
    );
    useDocEvent(
        "touchend",
        (ev) => onDragEnd(V(ev.changedTouches[0].clientX, ev.changedTouches[0].clientY)),
        [isDragging, setIsDragging, ...data]
    );

    return <button {...other}
                   onDragStart={(ev: React.DragEvent<HTMLElement>) => ev.preventDefault() }
                   onMouseDown={() => setIsDragging(true) }
                   onTouchStart={() => setIsDragging(true) }>
        {children}
    </button>
}
