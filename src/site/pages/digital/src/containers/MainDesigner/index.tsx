import {Create} from "serialeazy";
import {useLayoutEffect, useRef} from "react";

import {HEADER_HEIGHT} from "shared/utils/Constants";

import {V} from "Vector";

import {Input} from "core/utils/Input";

import {GroupAction} from "core/actions/GroupAction";
import {PlaceAction} from "core/actions/addition/PlaceAction";
import {CreateDeselectAllAction} from "core/actions/selection/SelectAction";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";

import {DigitalComponent} from "digital/models";
import {IC} from "digital/models/ioobjects";

import {useWindowSize} from "shared/utils/hooks/useWindowSize";
import {Droppable} from "shared/components/DragDroppable/Droppable";

import {GetRenderFunc} from "site/digital/utils/Rendering";
import {useDigitalSelector} from "site/digital/utils/hooks/useDigital";

import "./index.scss";


type Props = {
    info: DigitalCircuitInfo;
    canvas: React.MutableRefObject<HTMLCanvasElement>;
}
export const MainDesigner = ({info, canvas}: Props) => {
    const {camera, designer, history, selections, toolManager, renderer} = info;

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


    return (<>
        <Droppable ref={canvas}
                   onDrop={(pos, itemId, num) => {
                       num = num ?? 1;
                       if (!itemId || !(typeof itemId === "string") || !(typeof num === "number"))
                           return;
                       pos = camera.getWorldPos(pos.sub(V(0, canvas.current.getBoundingClientRect().top)));

                       const action = new GroupAction();
                       for (let i = 0; i < num; i++) {
                           let component: DigitalComponent;

                           // Check if the item is an IC or normal object
                           if (itemId.startsWith("ic")) { // IC
                               const [_, id] = itemId.split("/");
                               component = new IC(info.designer.getICData()[parseInt(id)]);
                           } else {
                               component = Create<DigitalComponent>(itemId);
                           }

                           if (!component) { // Invalid itemId, return
                               console.error("Failed to create item with id", itemId);
                               return;
                           }
                           component.setPos(pos);
                           action.add(new PlaceAction(designer, component));
                           pos = pos.add(0, component.getCullBox().getSize().y);
                       }
                       history.add(action.execute());
                       renderer.render();
                   }}>
            <canvas className="main__canvas"
                    width={w}
                    height={h-HEADER_HEIGHT} />
        </Droppable>
    </>);
}
