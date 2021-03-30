import React, {useEffect, useState} from "react"
import {V, Vector} from "Vector";

import {DragDropHandlers} from "./DragDropHandlers";


type Props = {
    children: React.ReactElement<{
        onDragStart?: React.DragEventHandler<HTMLElement>;
        onMouseDown?: React.MouseEventHandler<HTMLElement>;
        onTouchStart?: React.TouchEventHandler<HTMLElement>;
    }>;
    data: string;
};
export const Draggable = ({ children, data }: Props) => {
    const [{isDragging}, setState] = useState({ isDragging: false });

    function onDragEnd(pos: Vector) {
        if (!isDragging)
            return;
        DragDropHandlers.drop(data, pos);
        setState({ isDragging: false });
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
    }, [isDragging, setState]);

    return <>
        {React.cloneElement(children, {
            onDragStart: (ev: React.DragEvent<HTMLElement>) => {
                ev.preventDefault();
            },
            onMouseDown: () => {
                setState({ isDragging: true });
            },
            onTouchStart: () => {
                setState({ isDragging: true });
            },
        })}
    </>
}
