import {Create} from "serialeazy";
import {useEffect, useLayoutEffect, useRef} from "react";

import {HEADER_HEIGHT} from "shared/utils/Constants";

import {V} from "Vector";
import {Camera} from "math/Camera";

import {SelectionsWrapper}  from "core/utils/SelectionsWrapper";
import {RenderQueue}        from "core/utils/RenderQueue";
import {Input}              from "core/utils/Input";
import {Event}              from "core/utils/Events";

import {HistoryManager} from "core/actions/HistoryManager";
import {PlaceAction}    from "core/actions/addition/PlaceAction";

import {ToolManager}        from "core/tools/ToolManager";
import {InteractionTool}    from "core/tools/InteractionTool";
import {PanTool}            from "core/tools/PanTool";
import {RotateTool}         from "core/tools/RotateTool";
import {TranslateTool}      from "core/tools/TranslateTool";
import {WiringTool}         from "core/tools/WiringTool";
import {SplitWireTool}      from "core/tools/SplitWireTool";
import {SelectionBoxTool} from "core/tools/SelectionBoxTool";

import {Renderer}           from "core/rendering/Renderer";
import {CreateRenderers}    from "core/rendering/CreateRenderers";
import {Grid}               from "core/rendering/Grid";

import {DigitalCircuitDesigner, DigitalComponent} from "digital/models";
import {WireRenderer}           from "digital/rendering/ioobjects/WireRenderer";
import {ComponentRenderer}      from "digital/rendering/ioobjects/ComponentRenderer";
import {ToolRenderer} from "digital/rendering/ToolRenderer";

import {SelectionPopup}       from "shared/containers/SelectionPopup";
import {PositionModule}       from "shared/containers/SelectionPopup/modules/PositionModule";
import {ViewICButtonModule}   from "site/digital/containers/SelectionPopup/modules/ViewICButtonModule";
import {InputCountModule}     from "site/digital/containers/SelectionPopup/modules/InputCountModule";
import {ColorModule}          from "site/digital/containers/SelectionPopup/modules/ColorModule";
import {ClockFrequencyModule} from "site/digital/containers/SelectionPopup/modules/ClockFrequencyModule";
import {OutputCountModule}    from "site/digital/containers/SelectionPopup/modules/OutputCountModule";
import {SegmentCountModule}   from "site/digital/containers/SelectionPopup/modules/SegmentCountModule";
import {TextColorModule}      from "site/digital/containers/SelectionPopup/modules/TextColorModule";
import {BusButtonModule}      from "site/digital/containers/SelectionPopup/modules/BusButtonModule";
import {CreateICButtonModule} from "site/digital/containers/SelectionPopup/modules/CreateICButtonModule";

import {ICDesigner} from "site/digital/containers/ICDesigner";

import {useWindowSize} from "shared/utils/hooks/useWindowSize";

import "./index.scss";
import {connect} from "react-redux";
import {AppState} from "site/digital/state";
import {ICViewer} from "../ICViewer";
import {ContextMenu} from "shared/containers/ContextMenu";
import {CloseContextMenu, OpenContextMenu} from "shared/state/ContextMenu/actions";
import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";
import {DigitalItemNav} from "../DigitalItemNav";
import {DigitalPaste} from "site/digital/utils/DigitalPaste";


type OwnProps = {}
type StateProps = {}
type DispatchProps = {
    OpenContextMenu: typeof OpenContextMenu;
    CloseContextMenu: typeof CloseContextMenu;
}

type Props = StateProps & DispatchProps & OwnProps;
export const MainDesigner = (() => {
    const camera = new Camera();
    const renderQueue = new RenderQueue();
    const history = new HistoryManager();
    const designer = new DigitalCircuitDesigner(1);
    const selections = new SelectionsWrapper();

    const toolManager = new ToolManager(
        new InteractionTool(),
        PanTool,
        RotateTool,
        TranslateTool,
        WiringTool,
        SplitWireTool,
        SelectionBoxTool
    );

    const circuitInfo: DigitalCircuitInfo = {
        locked: false,

        history,
        camera,

        designer,

        input: undefined, // Initialize on init
        selections,

        renderer: renderQueue
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
        const selections = circuitInfo.selections.get();

        renderer.clear();

        Grid.render();

        Wires.renderAll(designer.getWires(), selections);
        Components.renderAll(designer.getObjects(), selections);

        Tools.render(toolManager);
    }


    return connect<StateProps, DispatchProps, OwnProps, AppState>(
        undefined,
        { OpenContextMenu, CloseContextMenu }
    )(
        ({OpenContextMenu, CloseContextMenu}: Props) => {
            const {w, h} = useWindowSize();
            const canvas = useRef<HTMLCanvasElement>();


            // On resize (useLayoutEffect happens sychronously so
            //  there's no pause/glitch when resizing the screen)
            useLayoutEffect(() => {
                camera.resize(w, h); // Update camera size when w/h changes
                renderQueue.render(); // Re-render
            }, [w, h]);


            // Initial function called after the canvas first shows up
            useLayoutEffect(() => {
                const renderer = new Renderer(canvas.current);
                const input = new Input(canvas.current);
                const renderers = CreateDigitalRenderers(renderer);

                designer.addCallback(() => renderQueue.render());

                circuitInfo.input = input;

                canvas.current.addEventListener("contextmenu", (e) => { e.preventDefault(); OpenContextMenu(); });

                input.addListener((event) => {
                    const change = toolManager.onEvent(event, circuitInfo);
                    if (change) renderQueue.render();

                    if (event.type === "mousedown")
                        CloseContextMenu();
                });

                renderQueue.setRenderFunction(() => render(renderers));
                renderQueue.render();
            }, []); // Pass empty array so that this only runs once on mount

            return (<>
                <DigitalItemNav info={circuitInfo} />


                <SelectionPopup info={circuitInfo}
                                modules={[PositionModule, InputCountModule,
                                          OutputCountModule, SegmentCountModule,
                                          ClockFrequencyModule,
                                          ColorModule, TextColorModule,
                                          BusButtonModule, CreateICButtonModule,
                                          ViewICButtonModule]} />


                <ICDesigner mainInfo={circuitInfo} />

                <ICViewer onActivate={() => circuitInfo.input.block()}
                          onClose   ={() => circuitInfo.input.unblock()} />


                <ContextMenu info={circuitInfo}
                             paste={(data) => DigitalPaste(data, circuitInfo)} />


                <canvas className="main__canvas"
                        width={w}
                        height={h-HEADER_HEIGHT}
                        ref={canvas}
                        onDragOver={(ev) => {
                                ev.preventDefault();
                        }}
                        onDrop={(ev) => {
                                const uuid = ev.dataTransfer.getData("custom/component");
                            if (!uuid)
                                return;
                            const rect = canvas.current.getBoundingClientRect();
                            const pos = V(ev.pageX, ev.clientY-rect.top);
                            const component = Create<DigitalComponent>(uuid);
                            component.setPos(camera.getWorldPos(pos));
                            history.add(new PlaceAction(designer, component).execute());
                            renderQueue.render();
                        }} />
            </>);
        }
    );
})();

