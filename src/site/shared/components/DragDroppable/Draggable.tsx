import React, {useEffect, useState} from "react"
import {V, Vector} from "Vector";

import {DragDropHandlers} from "./DragDropHandlers";


type Props = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    children: React.ReactNode;
    data: any[];
};
export const Draggable = ({ children, data, ...other }: Props) => {
    const [isDragging, setIsDragging] = useState(false);

    function onDragEnd(pos: Vector) {
        if (!isDragging)
            return;
        DragDropHandlers.drop(pos, ...data);
        setIsDragging(false);
    }

    useEffect(() => {
        function onMouseUp(ev: MouseEvent) {
            onDragEnd(V(ev.clientX, ev.clientY));
        }
        function onTouchUp(ev: TouchEvent) {
            onDragEnd(V(ev.changedTouches[0].clientX, ev.changedTouches[0].clientY));
        }

        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("touchend", onTouchUp);

        return () => {
            document.removeEventListener("mouseup", onMouseUp);
            document.removeEventListener("touchend", onTouchUp);
        }
    }, [isDragging, setIsDragging]);

    return <button {...other}
                   onDragStart={(ev: React.DragEvent<HTMLElement>) => ev.preventDefault() }
                   onMouseDown={() => setIsDragging(true) }
                   onTouchStart={() => setIsDragging(true) }>
        {children}
    </button>
}
