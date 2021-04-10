import React, {useEffect, useRef} from "react";

import {Vector} from "Vector";

import {DragDropHandlers} from "./DragDropHandlers";


type Props = {
    children: React.ReactElement;
    onDrop: (pos: Vector, ...data: any[]) => void;
};
export const Droppable = React.forwardRef(<T extends HTMLElement>({ children, onDrop }: Props, ref: React.MutableRefObject<T>) => {
    const actualRef = ref ?? useRef<T>();

    useEffect(() => {
        DragDropHandlers.add(actualRef.current, onDrop);
        return () => {
            DragDropHandlers.remove(actualRef.current);
        }
    }, [actualRef, onDrop]);

    return <>
        {React.cloneElement(children, {
            ref: actualRef,
            onDragOver: (ev: React.DragEvent<HTMLElement>) => ev.preventDefault()
        })}
    </>
});
