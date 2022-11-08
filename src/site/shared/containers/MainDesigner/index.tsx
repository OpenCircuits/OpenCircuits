import {useLayoutEffect, useRef, useState} from "react";

import {HEADER_HEIGHT} from "shared/utils/Constants";

import {V, Vector} from "Vector";

import {CircuitInfo, Cursor} from "core/utils/CircuitInfo";

import {DeselectAll} from "core/actions/units/Select";

import {AnyComponent, AnyPort, DefaultComponent} from "core/models/types";

import {CreateNComponents} from "shared/utils/CreateN";
import {GetRenderFunc}     from "shared/utils/GetRenderingFunc";

import {useSharedSelector} from "shared/utils/hooks/useShared";
import {useWindowSize}     from "shared/utils/hooks/useWindowSize";

import {Droppable} from "shared/components/DragDroppable/Droppable";

import "./index.scss";


type Props = {
    info: CircuitInfo;
    otherPlace?: (pos: Vector, itemKind: AnyComponent["kind"], num: number, ...otherData: unknown[]) => boolean;
    // This is a hack so that digital wires can draw on/off when being wired
    customWiringToolColor?: (originPort: AnyPort) => string;
}
export const MainDesigner = ({ info, otherPlace, customWiringToolColor }: Props) => {
    const { isLocked } = useSharedSelector(
        (state) => ({ isLocked: state.circuit.isLocked })
    );
    const { w, h } = useWindowSize();
    const canvas = useRef<HTMLCanvasElement>(null);
    const [ cursor, setCursor ] = useState(undefined as Cursor | undefined);

    // On resize (useLayoutEffect happens sychronously so
    //  there's no pause/glitch when resizing the screen)
    useLayoutEffect(() => {
        info.camera.resize(w, h-HEADER_HEIGHT); // Update camera size when w/h changes
        info.renderer.render(); // Re-render
    }, [info, w, h]);


    // Initial function called after the canvas first shows up
    useLayoutEffect(() => {
        if (!canvas.current)
            throw new Error("MainDesigner.useLayoutEffect failed: canvas is null");
        // Get render function
        const renderFunc = GetRenderFunc({ canvas: canvas.current, info, customWiringToolColor });

        info.renderer.setRenderFunction(() => renderFunc());
        info.renderer.render();

        // Setup input w/ canvas and return a tear down
        return info.input.setupOn(canvas.current);
    }, [info, canvas]); // Pass empty array so that this only runs once on mount


    // Setup listener to keep cursor in-sync with info.cursor
    useLayoutEffect(() => {
        const listener = () => setCursor(info.cursor);
        info.input.subscribe(listener);
        return () => info.input.unsubscribe(listener);
    }, [info, setCursor]);


    // Lock/unlock circuit
    useLayoutEffect(() => {
        info.locked = isLocked;
        if (isLocked) // Deselect everything
            info.history.add(DeselectAll(info.selections));
        info.history.setDisabled(isLocked);
        info.selections.setDisabled(isLocked);
    }, [info, isLocked]);


    return (
        <Droppable
            ref={canvas}
            onDrop={(pos, itemKind: AnyComponent["kind"], num = 1, ...otherData: unknown[]) => {
                if (!canvas.current)
                    throw new Error("MainDesigner.Droppable.onDrop failed: canvas.current is null");
                num = num ?? 1;
                if (!itemKind || !(typeof itemKind === "string") || !(typeof num === "number"))
                    return;
                if (!(itemKind in DefaultComponent)) {
                    console.warn(`Attempted to place item of kind: ${itemKind} which doesn't have info.`);
                    return;
                }
                pos = info.camera.getWorldPos(pos.sub(V(0, canvas.current.getBoundingClientRect().top)));

                const z = info.viewManager.getTopDepth() + 1;

                // If other place options are specified then do those
                //  otherwise default to CreateNComponents
                if (!otherPlace?.(pos, itemKind, num, otherData))
                    info.history.add(CreateNComponents(info, itemKind, num, pos, z));

                info.renderer.render();
            }}>
            <canvas
                className="main__canvas"
                style={{ cursor }}
                width={w}
                height={h-HEADER_HEIGHT} />
        </Droppable>
    );
}
