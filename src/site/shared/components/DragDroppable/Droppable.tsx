import React, {useEffect, useRef} from "react";

import {Vector} from "Vector";

import {DragDropHandlers} from "./DragDropHandlers";


type Props = {
    children: React.ReactElement;
    onDrop: (pos: Vector, ...data: unknown[]) => void;
};
export const Droppable = React.forwardRef(
    <T extends HTMLElement>({ children, onDrop }: Props, forwardedRed: React.RefObject<T>
) => {
    const defaultRef = useRef<T>();
    const ref = forwardedRed ?? defaultRef;

    useEffect(() => {
        const { current } = ref;
        if (!current)
            throw new Error("Droppable.useEffect failed: actualRef.current is null");
        DragDropHandlers.add(current, onDrop);
        return () => {
            DragDropHandlers.remove(current);
        }
    }, [ref, onDrop]);

    return (<>
        {React.cloneElement(children, {
            ref:        ref,
            onDragOver: (ev: React.DragEvent<HTMLElement>) => ev.preventDefault(),
        })}
    </>)
});
Droppable.displayName = "Droppable";
