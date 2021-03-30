import React, {useEffect, useRef} from "react";

import {Vector} from "Vector";

import {DragDropHandlers} from "./DragDropHandlers";


type Props = {
    children: React.ReactElement/*<{
        onDragOver?: React.DragEvent<HTMLElement>;
        onDrop?: React.DragEvent<HTMLElement>;
    }>*/;
    onDrop: (data: string, pos: Vector) => void;
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
        {/* {React.cloneElement(children, {
            onDragOver: (ev: React.DragEvent<HTMLElement>) => {
                ev.preventDefault();
            },
            onDrop: (ev: React.DragEvent<HTMLElement>) => {
                onDrop("");
            }
        })} */}
    </>
});
