import {useLayoutEffect, useRef} from "react";

import {HEADER_HEIGHT} from "shared/src/utils/Constants";

import {V, Vector} from "Vector";

import {Circuit} from "core/public";

import {useMainDesigner}    from "shared/src/utils/hooks/useDesigner";
import {useSharedSelector} from "shared/src/utils/hooks/useShared";
import {useWindowSize}     from "shared/src/utils/hooks/useWindowSize";

import {Droppable} from "shared/src/components/DragDroppable/Droppable";

import "./index.scss";


function PlaceNComponents(circuit: Circuit, itemKind: string, N: number, startPos: Vector, space: Vector.Spaces = "world") {
    circuit.beginTransaction();
    let pos = startPos;
    for (let i = 0; i < N; i++) {
        const comp = circuit.placeComponentAt(itemKind, pos, space);

        // Calculate bounds of the placed component to offset the position for the next one
        pos = pos.sub(0, comp.bounds.height);
    }
    circuit.commitTransaction();
}


type Props = {
    otherPlace?: (pos: Vector, itemKind: string, num: number, ...otherData: unknown[]) => boolean;
}
export const MainDesigner = ({ otherPlace }: Props) => {
    const designer = useMainDesigner();
    const { w, h } = useWindowSize();
    const canvas = useRef<HTMLCanvasElement>(null);

    useLayoutEffect(() => {
        if (!canvas.current)
            return;
        // TODO[model_refactor](leon) - Make a global declaration for this so we can set it w/o gross cast
        (window as unknown as Record<string, unknown>).Circuit = designer.circuit;
        return designer.attachCanvas(canvas.current);
    }, [designer, canvas]);

    // On resize (useLayoutEffect happens sychronously so
    //  there's no pause/glitch when resizing the screen)
    // TODO[model_refactor](leon) - reconsinder if we need to subtract HEADER_HEIGHT
    useLayoutEffect(() => designer.circuit.resize(w, h), [designer, w, h]);

    return (
        <Droppable
            ref={canvas}
            onDrop={(screenPos, itemKind: unknown, num?: unknown, ...otherData: unknown[]) => {  
                if (!itemKind)
                    return;

                if (!canvas.current)
                    throw new Error("MainDesigner.Droppable.onDrop failed: canvas.current is null");
                if (typeof itemKind !== "string")
                    throw new Error(`MainDesigner.Droppable.onDrop failed: Unknown itemKind! ${itemKind}`);

                const amt = (typeof num === "number" ? num : 1);
                const pos = screenPos.sub(V(0, canvas.current.getBoundingClientRect().top));

                // TODO[model_refactor](leon)
                // If other place options are specified then do those
                //  otherwise default to CreateNComponents
                if (!otherPlace?.(pos, itemKind, amt, otherData))
                    PlaceNComponents(designer.circuit, itemKind, amt, pos, "screen");
            }}>
            <canvas
                className="main__canvas"
                width={w}
                // TODO[model_refactor](leon) - reconsinder if we need to subtract HEADER_HEIGHT
                height={h} />
        </Droppable>
    );
}
