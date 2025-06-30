/* eslint-disable @typescript-eslint/ban-types */
import React, {useEffect} from "react";

import {Vector} from "Vector";

import {DragDropHandlers} from "./DragDropHandlers";


export const useDrop = (
    ref: React.RefObject<HTMLElement | null>,
    onDrop: (pos: Vector, ...data: unknown[]) => void,
    deps: React.DependencyList = [],
) => {
    useEffect(() => {
        if (!ref.current)
            return;
        const current = ref.current;

        const l1 = (ev: DragEvent) => {
            ev.preventDefault();
        };
        current.addEventListener("dragover", l1);
        DragDropHandlers.add(current, onDrop);
        return () => {
            current.removeEventListener("dragover", l1);
            DragDropHandlers.remove(current);
        };
    }, [ref, onDrop, ...deps]);
}
