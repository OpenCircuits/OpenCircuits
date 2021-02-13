import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {connect} from "react-redux";

import {IC_DESIGNER_VH, IC_DESIGNER_VW} from "site/utils/Constants";

import {V} from "Vector";
import {Camera} from "math/Camera";

import {Input} from "core/utils/Input";
import {RenderQueue} from "core/utils/RenderQueue";
import {SelectionsWrapper} from "core/utils/SelectionsWrapper";

import {HistoryManager} from "core/actions/HistoryManager";
import {FitToScreenHandler} from "core/tools/handlers/FitToScreenHandler";
import {UndoHandler} from "core/tools/handlers/UndoHandler";
import {RedoHandler} from "core/tools/handlers/RedoHandler";
import {DefaultTool} from "core/tools/DefaultTool";
import {ToolManager} from "core/tools/ToolManager";
import {PanTool} from "core/tools/PanTool";

import {Renderer} from "core/rendering/Renderer";
import {CreateRenderers} from "core/rendering/CreateRenderers";
import {Grid} from "core/rendering/Grid";

import {ICCircuitInfo} from "digital/utils/ICCircuitInfo";

import {DigitalCircuitDesigner} from "digital/models";
import {IC} from "digital/models/ioobjects";
import {ICData} from "digital/models/ioobjects/other/ICData";

import {ICPortTool} from "digital/tools/ICPortTool";
import {ICEdge, ICResizeTool} from "digital/tools/ICResizeTool";

import {WireRenderer} from "digital/rendering/ioobjects/WireRenderer";
import {ComponentRenderer} from "digital/rendering/ioobjects/ComponentRenderer";
import {ToolRenderer} from "digital/rendering/ToolRenderer";

import {useWindowSize} from "site/utils/hooks/useWindowSize";
import {CloseICDesigner} from "site/state/ICDesigner/actions";
import {AppState} from "site/state";

import "./index.scss";


type OwnProps = {
    onActivate: () => void;
    onClose: (data?: ICData) => void;
}
type StateProps = {
    active: boolean;
    data: ICData;
}
type DispatchProps = {
    closeDesigner: (cancelled?: boolean) => void;
}

type Props = StateProps & DispatchProps & OwnProps;
export const ICDesigner = (() => {
    const camera = new Camera();
    const renderQueue = new RenderQueue();
    const history = new HistoryManager();
    const designer = new DigitalCircuitDesigner(1, () => renderQueue.render());
    const selections = new SelectionsWrapper();

    const toolManager = new ToolManager(
        new DefaultTool(FitToScreenHandler, RedoHandler, UndoHandler),
        PanTool,
        ICPortTool,
        ICResizeTool
    );

    const circuitInfo: ICCircuitInfo = {
        locked: false,
        history,
        camera,
        designer,
        input: undefined, // Initialize on init
        selections,
        ic: undefined
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


    const EdgesToCursors: Record<ICEdge, string> = {
        "none": "default",
        "horizontal": "ew-resize",
        "vertical": "ns-resize"
    };


    return connect<StateProps, DispatchProps, OwnProps, AppState>(
        (state: AppState) => ({ active: state.icDesigner.active,
                                data: state.icDesigner.ic }),
        { closeDesigner: CloseICDesigner }
    )(
        ({active, data, onActivate, onClose, closeDesigner}: Props) => {
            const {w, h} = useWindowSize();
            const canvas = useRef<HTMLCanvasElement>();
            const [{name}, setName] = useState({ name: "" });
            const [{cursor}, setCursor] = useState({ cursor: "default" });

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
                console.log("should only happen once1");
                const renderer = new Renderer(canvas.current);
                const input = new Input(canvas.current);
                const renderers = CreateDigitalRenderers(renderer);

                circuitInfo.input = input;

                input.addListener((event) => {
                    const change = toolManager.onEvent(event, circuitInfo);

                    // Change cursor
                    let newCursor = ICPortTool.findPort(circuitInfo) === undefined ? "none" : "move";
                    if (newCursor === "none")
                        newCursor = EdgesToCursors[ICResizeTool.findEdge(circuitInfo)];
                    setCursor({ cursor: newCursor });

                    if (change) renderQueue.render();
                });

                renderQueue.setRenderFunction(() => render(renderers));
                renderQueue.render();
            }, [setCursor]); // Pass empty array so that this only runs once on mount

            useLayoutEffect(() => {
                if (!data)
                    return;
                data.setName(name);
                renderQueue.render();
            }, [name, data]);

            // Happens when activated
            useLayoutEffect(() => {
                if (!active || !data)
                    return;
                // Clear name
                setName({ name: "" });

                // Callback
                onActivate();

                // Reset designer and add IC
                designer.reset();
                circuitInfo.ic = new IC(data);
                circuitInfo.ic.setPos(V());
                designer.addObject(circuitInfo.ic);

                // Set camera
                camera.setPos(V());

                renderQueue.render();
            }, [active, data, setName, onActivate]);

            return (
                <div className="icdesigner" style={{ display: (active ? "initial" : "none") }}>
                    <canvas ref={canvas}
                            width={w*IC_DESIGNER_VW}
                            height={h*IC_DESIGNER_VH}
                            style={{ cursor }} />

                    <input type="text"
                           placeholder="IC Name"
                           onChange={(ev) => setName({name: ev.target.value})} />

                    <div className="icdesigner__buttons">
                        <button name="confirm" onClick={() => { onClose(data); closeDesigner(); }}>
                            Confirm
                        </button>
                        <button name="cancel"  onClick={() => { onClose(); closeDesigner(true); }}>
                            Cancel
                        </button>
                    </div>
                </div>
            );
        }
    );
})();