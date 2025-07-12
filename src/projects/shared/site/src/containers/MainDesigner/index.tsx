import {useEffect, useLayoutEffect, useRef} from "react";

import {HEADER_HEIGHT} from "shared/site/utils/Constants";

import {V, Vector} from "Vector";

import {Circuit} from "shared/api/circuit/public";

import {useCurDesigner} from "shared/site/utils/hooks/useDesigner";
import {useWindowSize}  from "shared/site/utils/hooks/useWindowSize";

import {useDrop} from "shared/site/components/DragDroppable/useDrop";

import "./index.scss";
import {SetCircuitSaved} from "shared/site/state/CircuitInfo";
import {useSharedDispatch, useSharedSelector} from "shared/site/utils/hooks/useShared";
import {Rect} from "math/Rect";


function PlaceNComponents(circuit: Circuit, itemKind: string, N: number, startPos: Vector) {
    circuit.beginTransaction();
    let pos = startPos;
    for (let i = 0; i < N; i++) {
        const comp = circuit.placeComponentAt(itemKind, pos);

        // Calculate bounds of the placed component to offset the position for the next one
        // Need to factor in port bounds, most noticeable with LEDs
        pos = pos.sub(0, Rect.Bounding([comp.bounds, ...comp.allPorts.map(({ bounds }) => bounds)]).height);
    }
    circuit.commitTransaction("Placed Multiple Of Component");
}


type Props = {
    otherPlace?: (pos: Vector, itemKind: string, num: number, ...otherData: unknown[]) => boolean;
}
export const MainDesigner = ({ otherPlace }: Props) => {
    const designer = useCurDesigner();
    const { w, h } = useWindowSize();
    const { isLocked } = useSharedSelector((state) => ({ isLocked: state.circuit.isLocked }));
    const canvas = useRef<HTMLCanvasElement>(null);

    // When the circuit changes at all, set the circuit as unsaved
    const dispatch = useSharedDispatch();
    useEffect(() => designer.circuit.subscribe((_ev) =>
        dispatch(SetCircuitSaved(false))),
    [designer, dispatch]);

    // Sync circuit-lock
    useEffect(() => {
        if (isLocked) {
            // Clear selections when locking
            designer.circuit.selections.clear();
        }
        designer.isLocked = isLocked;
    }, [designer, isLocked]);

    useLayoutEffect(() => {
        if (!canvas.current)
            return;
        window.Circuit = designer.circuit;
        window.CircuitDesigner = designer;
        designer.viewport.margin = { top: HEADER_HEIGHT };
        return designer.viewport.attachCanvas(canvas.current);
    }, [designer, canvas]);

    // On resize (useLayoutEffect happens sychronously so
    //  there's no pause/glitch when resizing the screen)
    useLayoutEffect(() => designer.viewport.resize(w, h), [designer, w, h]);

    useDrop(canvas, (screenPos, itemKind: unknown, num?: unknown, ...otherData: unknown[]) => {
        if (!itemKind)
            return;

        if (!canvas.current)
            throw new Error("MainDesigner.Droppable.onDrop failed: canvas.current is null");
        if (typeof itemKind !== "string")
            throw new Error(`MainDesigner.Droppable.onDrop failed: Unknown itemKind! ${itemKind}`);

        const amt = (typeof num === "number" ? num : 1);
        const pos = designer.viewport.toWorldPos(
            screenPos.sub(V(0, canvas.current.getBoundingClientRect().top)));

        // If other place options are specified then do those
        //  otherwise default to CreateNComponents
        if (!otherPlace?.(pos, itemKind, amt, otherData))
            PlaceNComponents(designer.circuit, itemKind, amt, pos);
    }, [designer]);

    return (
        <canvas
            ref={canvas}
            className="main__canvas"
            width={w}
            height={h} />
    );
}
