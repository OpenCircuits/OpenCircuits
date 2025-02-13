import React, {useEffect, useRef} from "react";

import {Vector} from "Vector";

import {DragDropHandlers} from "./DragDropHandlers";


type Props = {
    children: React.ReactElement;
    onDrop: (pos: Vector, ...data: unknown[]) => void;
};
export const Droppable = React.forwardRef(
    <T extends HTMLElement>({ children, onDrop }: Props, ref: React.ForwardedRef<T>) => {
    const myRef = useRef<T>();

    useEffect(() => {
        const { current } = myRef;
        if (!current)
            throw new Error("Droppable.useEffect failed: actualRef.current is null");
        DragDropHandlers.add(current, onDrop);
        return () => {
            DragDropHandlers.remove(current);
        }
    }, [myRef, onDrop]);

    return (<>
        {React.cloneElement(children, {
            ref: (node: T) => {
                // Set forwarded ref and our ref
                myRef.current = node;
                if (typeof ref === "function")
                    ref(node);
                else if (ref)
                    ref.current = node;
            },
            onDragOver: (ev: React.DragEvent<HTMLElement>) => ev.preventDefault(),
        })}
    </>)
});
Droppable.displayName = "Droppable";
