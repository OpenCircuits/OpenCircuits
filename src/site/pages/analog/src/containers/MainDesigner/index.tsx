import {useLayoutEffect, useState} from "react";

import {HEADER_HEIGHT} from "shared/utils/Constants";

import {V} from "Vector";

import {Input} from "core/utils/Input";
import {Cursor} from "core/utils/CircuitInfo";

import {CreateGroupPlaceAction} from "core/actions/addition/PlaceAction";
import {CreateDeselectAllAction} from "core/actions/selection/SelectAction";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";

import {useWindowSize} from "shared/utils/hooks/useWindowSize";
import {Droppable} from "shared/components/DragDroppable/Droppable";

import {GetRenderFunc} from "site/analog/utils/Rendering";
import {useAnalogSelector} from "site/analog/utils/hooks/useAnalog";
import {AnalogCreateN} from "site/analog/utils/AnalogCreate";

import "./index.scss";


type Props = {
    info: AnalogCircuitInfo;
    canvas: React.RefObject<HTMLCanvasElement>;
}
export const MainDesigner = ({ info, canvas }: Props) => {
    const { camera, designer, history, selections, toolManager, renderer } = info;

    const { isLocked } = useAnalogSelector(
        state => ({ isLocked: state.circuit.isLocked })
    );

    const { w, h } = useWindowSize();

    const [ cursor, setCursor ] = useState(undefined as Cursor | undefined);


    // On resize (useLayoutEffect happens sychronously so
    //  there's no pause/glitch when resizing the screen)
    useLayoutEffect(() => {
        camera.resize(w, h-HEADER_HEIGHT); // Update camera size when w/h changes
        renderer.render(); // Re-render
    }, [w, h]);


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
            const change = toolManager.onEvent(event, info);

            // Update cursor
            setCursor(info.cursor);

            if (change) renderer.render();
        });

        // Add render callbacks and set render function
        designer.addCallback(() => renderer.render());

        renderer.setRenderFunction(() => renderFunc());
        renderer.render();
    }, []); // Pass empty array so that this only runs once on mount


    // Lock/unlock circuit
    useLayoutEffect(() => {
        info.locked = isLocked;
        if (isLocked) // Deselect everything
            history.add(CreateDeselectAllAction(selections).execute());
        history.setDisabled(isLocked);
        selections.setDisabled(isLocked);
    }, [isLocked]);


    return (<>
        <Droppable
            ref={canvas}
            onDrop={(pos, itemId, num) => {
                if (!canvas.current)
                    throw new Error("MainDesigner.Droppable.onDrop failed: canvas.current is null");
                num = num ?? 1;
                if (!itemId || !(typeof itemId === "string") || !(typeof num === "number"))
                    return;
                pos = camera.getWorldPos(pos.sub(V(0, canvas.current.getBoundingClientRect().top)));

                history.add(
                    CreateGroupPlaceAction(designer, AnalogCreateN(pos, itemId, designer, num)).execute()
                );
                renderer.render();
            }}>
            <canvas
                className="main__canvas"
                style={{ cursor }}
                width={w}
                height={h-HEADER_HEIGHT} />
        </Droppable>
    </>);
}
