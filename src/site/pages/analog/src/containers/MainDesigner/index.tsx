import {useLayoutEffect, useState} from "react";

import {HEADER_HEIGHT} from "shared/utils/Constants";

import {V} from "Vector";

import {Cursor} from "core/utils/CircuitInfo";
import {Input}  from "core/utils/Input";


import {PlaceGroup}  from "core/actions/units/Place";
import {DeselectAll} from "core/actions/units/Select";

import {AnalogComponentInfo} from "core/models/info/analog";

import {CreateComponent} from "core/models/utils/CreateComponent";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";

import {GetRenderFunc} from "shared/utils/GetRenderingFunc";

import {useWindowSize} from "shared/utils/hooks/useWindowSize";

import {Droppable} from "shared/components/DragDroppable/Droppable";

import {useAnalogSelector} from "site/analog/utils/hooks/useAnalog";

import "./index.scss";


type Props = {
    info: AnalogCircuitInfo;
    canvas: React.RefObject<HTMLCanvasElement>;
}
export const MainDesigner = ({ info, canvas }: Props) => {
    const { isLocked } = useAnalogSelector(
        (state) => ({ isLocked: state.circuit.isLocked })
    );

    const { w, h } = useWindowSize();

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
        // Create input w/ canvas
        info.input = new Input(canvas.current);

        // Get render function
        const renderFunc = GetRenderFunc({ canvas: canvas.current, info });

        // Add input listener
        info.input.addListener((event) => {
            const change = info.toolManager.onEvent(event, info);

            // Update cursor
            setCursor(info.cursor);

            if (change)
                info.renderer.render();
        });

        // // Add render callbacks and set render function
        // info.designer.addCallback(() => info.renderer.render());

        info.renderer.setRenderFunction(() => renderFunc());
        info.renderer.render();
    }, [info, canvas]); // Pass empty array so that this only runs once on mount


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
            onDrop={(pos, itemKind, num = 1) => {
                if (!canvas.current)
                    throw new Error("MainDesigner.Droppable.onDrop failed: canvas.current is null");
                if (!itemKind || !(typeof itemKind === "string") || !(typeof num === "number"))
                    return;
                if (!(itemKind in AnalogComponentInfo)) {
                    console.warn(`Attempted to place item of kind: ${itemKind} which doesn't have analog info.`);
                    return;
                }
                pos = info.camera.getWorldPos(pos.sub(V(0, canvas.current.getBoundingClientRect().top)));

                // info.history.add(
                //     CreateGroupPlaceAction(info.designer, AnalogCreateN(pos, itemId, info.designer, num))
                // );
                const [comp, ports] = CreateComponent(
                    itemKind as keyof typeof AnalogComponentInfo,
                    info.viewManager.getTopDepth() + 1
                );
                comp.x = pos.x;
                comp.y = pos.y;
                info.history.add(PlaceGroup(info.circuit, [comp, ...ports]));

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
