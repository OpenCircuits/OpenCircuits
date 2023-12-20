import {useLayoutEffect, useRef} from "react";

import {HEADER_HEIGHT} from "shared/utils/Constants";

import {V, Vector} from "Vector";

import {useMainDesigner}    from "shared/utils/hooks/useDesigner";
import {useSharedSelector} from "shared/utils/hooks/useShared";
import {useWindowSize}     from "shared/utils/hooks/useWindowSize";

import {Droppable} from "shared/components/DragDroppable/Droppable";

import "./index.scss";


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
            onDrop={(pos, itemKind: unknown, num?: unknown, ...otherData: unknown[]) => {
                if (!canvas.current)
                    throw new Error("MainDesigner.Droppable.onDrop failed: canvas.current is null");
                pos = pos.sub(V(0, canvas.current.getBoundingClientRect().top));

                // TODO[model_refactor](leon)
                // // If other place options are specified then do those
                // //  otherwise default to CreateNComponents
                // if (!otherPlace?.(pos, itemKind, num ?? 1, otherData))
                //     circuit.placeN(itemKind, num ?? 1, pos, "screen");
            }}>
            <canvas
                className="main__canvas"
                width={w}
                // TODO[model_refactor](leon) - reconsinder if we need to subtract HEADER_HEIGHT
                height={h} />
        </Droppable>
    );
}
