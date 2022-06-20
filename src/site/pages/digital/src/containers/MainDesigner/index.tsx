import {useLayoutEffect} from "react";

import {HEADER_HEIGHT} from "shared/utils/Constants";

import {V} from "Vector";

import {Input} from "core/utils/Input";

import {CreateGroupPlaceAction} from "core/actions/addition/PlaceAction";
import {CreateDeselectAllAction} from "core/actions/selection/SelectAction";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";

import {useWindowSize} from "shared/utils/hooks/useWindowSize";
import {usePageVisibility} from "shared/utils/hooks/usePageVisibility";
import {Droppable} from "shared/components/DragDroppable/Droppable";

import {GetRenderFunc} from "site/digital/utils/Rendering";
import {useDigitalSelector} from "site/digital/utils/hooks/useDigital";
import {DigitalCreateN, SmartPlace, SmartPlaceOptions} from "site/digital/utils/DigitalCreate";

import "./index.scss";


type Props = {
    info: DigitalCircuitInfo;
    canvas: React.RefObject<HTMLCanvasElement>;
}
export const MainDesigner = ({info, canvas}: Props) => {
    const {camera, designer, history, selections, toolManager, renderer} = info;

    const isPageVisible = usePageVisibility();

    const {isLocked} = useDigitalSelector(
        state => ({ isLocked: state.circuit.isLocked })
    );

    const {w, h} = useWindowSize();


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

    useLayoutEffect(() => {
        if (isPageVisible)
            info.designer.resume();
        else
            info.designer.pause();
    }, [isPageVisible]);


    return (<>
        <Droppable ref={canvas}
                   onDrop={(pos, itemId, num, smartPlaceOptions: SmartPlaceOptions) => {
                       if (!canvas.current)
                           throw new Error("MainDesigner.Droppable.onDrop failed: canvas.current is null");
                       num = num ?? 1;
                       if (!itemId || !(typeof itemId === "string") || !(typeof num === "number"))
                           return;
                       pos = camera.getWorldPos(pos.sub(V(0, canvas.current.getBoundingClientRect().top)));

                       if (smartPlaceOptions !== SmartPlaceOptions.Off) {
                           history.add(SmartPlace(pos, itemId, designer, num, smartPlaceOptions).execute());
                       } else {
                           history.add(
                               CreateGroupPlaceAction(designer, DigitalCreateN(pos, itemId, designer, num)).execute()
                           );
                       }
                       renderer.render();
                   }}>
            <canvas className="main__canvas"
                    width={w}
                    height={h-HEADER_HEIGHT} />
        </Droppable>
    </>);
}
