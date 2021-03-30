import {Create} from "serialeazy";
import {useLayoutEffect, useRef} from "react";
import {connect} from "react-redux";

import {HEADER_HEIGHT} from "shared/utils/Constants";

import {V} from "Vector";

import {Input} from "core/utils/Input";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";

import {PlaceAction} from "core/actions/addition/PlaceAction";
import {CreateDeselectAllAction} from "core/actions/selection/SelectAction";

import {DigitalComponent} from "digital/models";

import {useWindowSize} from "shared/utils/hooks/useWindowSize";
import {Droppable} from "shared/components/DragDroppable/Droppable";

import {GetRenderFunc} from "site/digital/utils/Rendering";
import {AppState} from "site/digital/state";

import "./index.scss";


type OwnProps = {
    info: DigitalCircuitInfo;
}
type StateProps = {
    isLocked: boolean;
}
type DispatchProps = {}

type Props = StateProps & DispatchProps & OwnProps;
const _MainDesigner = ({info, isLocked}: Props) => {
    const {camera, designer, history, selections, toolManager, renderer} = info;

    const {w, h} = useWindowSize();
    const canvas = useRef<HTMLCanvasElement>();


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
                   onDrop={(data, pos) => {
                       if (!data)
                           return;
                       pos = pos.sub(V(0, canvas.current.getBoundingClientRect().top));
                       const component = Create<DigitalComponent>(data);
                       component.setPos(camera.getWorldPos(pos));
                       history.add(new PlaceAction(designer, component).execute());
                       renderer.render();
                   }}>
            <canvas className="main__canvas"
                    width={w}
                    height={h-HEADER_HEIGHT} />
        </Droppable>
    </>);
}


export const MainDesigner = connect<StateProps, DispatchProps, OwnProps, AppState>(
    (state) => ({ isLocked: state.circuit.isLocked }),
    { }
)(_MainDesigner);
