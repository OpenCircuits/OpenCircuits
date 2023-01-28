import {useLayoutEffect, useRef} from "react";

import {HEADER_HEIGHT} from "shared/utils/Constants";

import {V, Vector} from "Vector";

import {useMainCircuit}    from "shared/utils/hooks/useCircuit";
import {useSharedSelector} from "shared/utils/hooks/useShared";
import {useWindowSize}     from "shared/utils/hooks/useWindowSize";

import {Droppable} from "shared/components/DragDroppable/Droppable";

import "./index.scss";


type Props = {
    otherPlace?: (pos: Vector, itemKind: string, num: number, ...otherData: unknown[]) => boolean;
}
export const MainDesigner = ({ otherPlace }: Props) => {
    const circuit = useMainCircuit();
    const { isLocked } = useSharedSelector(
        (state) => ({ isLocked: state.circuit.isLocked })
    );
    const { w, h } = useWindowSize();
    const canvas = useRef<HTMLCanvasElement>(null);

    // On resize (useLayoutEffect happens sychronously so
    //  there's no pause/glitch when resizing the screen)
    useLayoutEffect(() => circuit.camera.resize(w, h-HEADER_HEIGHT), [circuit, w, h]);

    // Initial function called after the canvas first shows up
    useLayoutEffect(() => circuit.setupCanvas(canvas), [circuit, canvas]);

    // Lock/unlock circuit
    useLayoutEffect(() => (circuit.locked = isLocked), [circuit, isLocked]);

    return (
        <Droppable
            ref={canvas}
            onDrop={(pos, itemKind: string, num?: number, ...otherData: unknown[]) => {
                if (!canvas.current)
                    throw new Error("MainDesigner.Droppable.onDrop failed: canvas.current is null");
                pos = pos.sub(V(0, canvas.current.getBoundingClientRect().top));

                // If other place options are specified then do those
                //  otherwise default to CreateNComponents
                if (!otherPlace?.(pos, itemKind, num ?? 1, otherData))
                    circuit.placeN(itemKind, num ?? 1, pos, "screen");
            }}>
            <canvas
                className="main__canvas"
                width={w}
                height={h-HEADER_HEIGHT} />
        </Droppable>
    );
}
