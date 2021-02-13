import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {connect} from "react-redux";

import {IC_VIEWER_ZOOM_PADDING_RATIO} from "core/utils/Constants";
import {IC_DESIGNER_VH, IC_DESIGNER_VW} from "site/utils/Constants";

import {Camera} from "math/Camera";

import {Input} from "core/utils/Input";
import {RenderQueue} from "core/utils/RenderQueue";
import {CircuitInfo} from "core/utils/CircuitInfo";
import {GetCameraFit} from "core/utils/ComponentUtils";
import {SelectionsWrapper} from "core/utils/SelectionsWrapper";

import {CullableObject} from "core/models";

import {MoveCameraAction} from "core/actions/camera/MoveCameraAction";
import {InteractionTool} from "core/tools/InteractionTool";
import {ToolManager} from "core/tools/ToolManager";
import {PanTool} from "core/tools/PanTool";

import {Renderer} from "core/rendering/Renderer";
import {CreateRenderers} from "core/rendering/CreateRenderers";
import {Grid} from "core/rendering/Grid";

import {DigitalCircuitDesigner} from "digital/models";
import {ICData} from "digital/models/ioobjects/other/ICData";

import {WireRenderer} from "digital/rendering/ioobjects/WireRenderer";
import {ComponentRenderer} from "digital/rendering/ioobjects/ComponentRenderer";
import {ToolRenderer} from "digital/rendering/ToolRenderer";

import {useWindowSize} from "site/utils/hooks/useWindowSize";
import {CloseICViewer} from "site/state/ICViewer/actions";
import {AppState} from "site/state";

import "./index.scss";


type OwnProps = {
    onActivate: () => void;
    onClose: () => void;
}
type StateProps = {
    active: boolean;
    data: ICData;
}
type DispatchProps = {
    closeDesigner: (cancelled?: boolean) => void;
}

type Props = StateProps & DispatchProps & OwnProps;
export const ICViewer = (() => {
    const camera = new Camera();
    const renderQueue = new RenderQueue();
    const designer = new DigitalCircuitDesigner(1, () => renderQueue.render());
    const toolManager = new ToolManager(new InteractionTool([]), PanTool);
    const selections = new SelectionsWrapper();

    const circuitInfo: CircuitInfo = {
        locked: false,
        history: undefined,
        camera,
        designer,
        input: undefined, // Initialize on init
        selections: selections
    };
    function CreateDigitalRenderers(renderer: Renderer) {
        return CreateRenderers(renderer, circuitInfo, {
            gridRenderer: Grid,
            wireRenderer: WireRenderer,
            componentRenderer: ComponentRenderer,
            toolRenderer: ToolRenderer
        });
    }
    function render({renderer, Grid, Wires, Components, Tools}: ReturnType<typeof CreateDigitalRenderers>) {
        renderer.clear();

        Grid.render();

        Wires.renderAll(designer.getWires(), []);
        Components.renderAll(designer.getObjects(), []);

        Tools.render(toolManager);
    }


    return connect<StateProps, DispatchProps, OwnProps, AppState>(
        (state: AppState) => ({ active: state.icViewer.active,
                                data: state.icViewer.ic }),
        { closeDesigner: CloseICViewer }
    )(
        ({active, data, onActivate, onClose, closeDesigner}: Props) => {
            const {w, h} = useWindowSize();
            const canvas = useRef<HTMLCanvasElement>();

            // On resize (useLayoutEffect happens sychronously so
            //  there's no pause/glitch when resizing the screen)
            useLayoutEffect(() => {
                if (!active)
                    return;
                camera.resize(w*IC_DESIGNER_VW, h*IC_DESIGNER_VH); // Update camera size when w/h changes
                renderQueue.render(); // Re-render
            }, [active, w, h]);


            // Initial function called after the canvas first shows up
            useEffect(() => {
                const renderer = new Renderer(canvas.current);
                const input = new Input(canvas.current);
                const renderers = CreateDigitalRenderers(renderer);

                circuitInfo.input = input;

                input.addListener((event) => {
                    const change = toolManager.onEvent(event, circuitInfo);
                    if (change) renderQueue.render();
                });

                renderQueue.setRenderFunction(() => render(renderers));
                renderQueue.render();
            }, []); // Pass empty array so that this only runs once on mount

            // Happens when activated
            useLayoutEffect(() => {
                if (!active || !data)
                    return;
                // Callback
                onActivate();

                const inside = data.copy();

                // Reset designer and add IC insides
                designer.reset();
                designer.addGroup(inside);

                // Adjust the camera so it all fits in the viewer
                const [pos, zoom] = GetCameraFit(camera, inside.toList() as CullableObject[], IC_VIEWER_ZOOM_PADDING_RATIO);
                new MoveCameraAction(camera, pos, zoom).execute();

                renderQueue.render();
            }, [active, data, onActivate]);

            return (
                <div className="icviewer" style={{ display: (active ? "initial" : "none") }}>
                    <canvas ref={canvas}
                            width={w*IC_DESIGNER_VW}
                            height={h*IC_DESIGNER_VH} />

                    <div className="icviewer__buttons">
                        <button name="close" onClick={() => { onClose(); closeDesigner(true); }}>
                            Close
                        </button>
                    </div>
                </div>
            );
        }
    );
})();