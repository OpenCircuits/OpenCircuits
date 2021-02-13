import {Create} from "serialeazy";
import {useEffect, useLayoutEffect, useRef} from "react";

import {HEADER_HEIGHT} from "site/utils/Constants";

import {V} from "Vector";
import {Camera} from "math/Camera";

import {SelectionsWrapper}  from "core/utils/SelectionsWrapper";
import {RenderQueue}        from "core/utils/RenderQueue";
import {Input}              from "core/utils/Input";
import {CircuitInfo}        from "core/utils/CircuitInfo";
import {Event}              from "core/utils/Events";

import {HistoryManager} from "core/actions/HistoryManager";
import {GroupAction} from "core/actions/GroupAction";
import {CreateDeselectAllAction, SelectAction} from "core/actions/selection/SelectAction";
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

import {CreateICDataAction} from "digital/actions/CreateICDataAction";

import {IC} from "digital/models/ioobjects";
import {DigitalCircuitDesigner, DigitalComponent} from "digital/models";
import {WireRenderer}           from "digital/rendering/ioobjects/WireRenderer";
import {ComponentRenderer}      from "digital/rendering/ioobjects/ComponentRenderer";
import {ToolRenderer} from "digital/rendering/ToolRenderer";

import {ICDesigner} from "site/containers/ICDesigner";
import {SelectionPopup}       from "site/containers/SelectionPopup";
import {PositionModule}       from "site/containers/SelectionPopup/modules/PositionModule";
import {InputCountModule}     from "site/containers/SelectionPopup/modules/InputCountModule";
import {ColorModule}          from "site/containers/SelectionPopup/modules/ColorModule";
import {ClockFrequencyModule} from "site/containers/SelectionPopup/modules/ClockFrequencyModule";
import {OutputCountModule}    from "site/containers/SelectionPopup/modules/OutputCountModule";
import {SegmentCountModule}   from "site/containers/SelectionPopup/modules/SegmentCountModule";
import {TextColorModule}      from "site/containers/SelectionPopup/modules/TextColorModule";
import {BusButtonModule}      from "site/containers/SelectionPopup/modules/BusButtonModule";
import {ViewICButtonModule}   from "site/containers/SelectionPopup/modules/ViewICButtonModule";
import {CreateICButtonModule} from "site/containers/SelectionPopup/modules/CreateICButtonModule";

import {useWindowSize} from "site/utils/hooks/useWindowSize";

import "./index.scss";
import {connect} from "react-redux";
import {AppState} from "site/state";
import {AddICData, RemoveICData} from "site/state/ItemNav/actions";
import {ICViewer} from "../ICViewer";


type OwnProps = {}
type StateProps = {}
type DispatchProps = {
    addICData: typeof AddICData;
    removeICData: typeof RemoveICData;
}

type Props = StateProps & DispatchProps & OwnProps;
export const MainDesigner = (() => {
    const camera = new Camera();
    const renderQueue = new RenderQueue();
    const history = new HistoryManager();
    const designer = new DigitalCircuitDesigner(1, () => renderQueue.render());
    const selections = new SelectionsWrapper();

    type listener = (ev: Event, change: boolean) => void;
    const eventHandler = {
        listeners: [] as listener[],
        addListener: (l: listener) => {
            eventHandler.listeners.push(l);
        }
    }

    const toolManager = new ToolManager(
        new InteractionTool(),
        PanTool,
        RotateTool,
        TranslateTool,
        WiringTool,
        SplitWireTool,
        SelectionBoxTool
    );

    const circuitInfo: CircuitInfo = {
        locked: false,

        history,
        camera,

        designer,

        input: undefined, // Initialize on init
        selections
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
        { addICData: AddICData, removeICData: RemoveICData }
    )(
        ({addICData, removeICData}: Props) => {
            const {w, h} = useWindowSize();
            const canvas = useRef<HTMLCanvasElement>();


            // On resize (useLayoutEffect happens sychronously so
            //  there's no pause/glitch when resizing the screen)
            useLayoutEffect(() => {
                camera.resize(w, h); // Update camera size when w/h changes
                renderQueue.render(); // Re-render
            }, [w, h]);


            // Initial function called after the canvas first shows up
            useEffect(() => {
                const renderer = new Renderer(canvas.current);
                const input = new Input(canvas.current);
                const renderers = CreateDigitalRenderers(renderer);

                circuitInfo.input = input;

                input.addListener((event) => {
                    const change = toolManager.onEvent(event, circuitInfo);
                    if (change) renderQueue.render();
                    eventHandler.listeners.forEach(l => l(event, change));
                });

                renderQueue.setRenderFunction(() => render(renderers));
                renderQueue.render();
            }, []); // Pass empty array so that this only runs once on mount

            return (<>
                <SelectionPopup camera={camera}
                                modules={[PositionModule, InputCountModule,
                                          OutputCountModule, SegmentCountModule,
                                          ClockFrequencyModule,
                                          ColorModule, TextColorModule,
                                          BusButtonModule, CreateICButtonModule,
                                          ViewICButtonModule]}
                                selections={selections}
                                addAction={(a) => {
                                    history.add(a);
                                    eventHandler.listeners.forEach(l => l({type:"unknown"}, true));
                                }}
                                render={() => renderQueue.render()}
                                eventHandler={eventHandler} />


                <ICDesigner onActivate={() => {
                                // Stop events on MainDesigner while ICDesigner is open
                                circuitInfo.input.block();
                            }}
                            onClose={(data) => {
                                if (data) {
                                    // Create IC on center of screen
                                    const ic = new IC(data);
                                    ic.setPos(camera.getPos());

                                    let index = -1;

                                    const icDataAction = {
                                        execute: () => {
                                            designer.addICData(data);
                                            if (index === -1)
                                                index = designer.getICData().indexOf(data);
                                            addICData({ name: ic.getName(), index });
                                            return icDataAction;
                                        },
                                        undo: () => {
                                            designer.removeICData(data);
                                            removeICData(index);
                                            return icDataAction;
                                        }
                                    };

                                    // Deselect other things, create IC and select it
                                    const action = new GroupAction([
                                        CreateDeselectAllAction(selections),
                                        icDataAction,
                                        new PlaceAction(designer, ic),
                                        new SelectAction(selections, ic)
                                    ]);
                                    history.add(action.execute());
                                    renderQueue.render();
                                }
                                circuitInfo.input.unblock();
                            }} />

                <ICViewer onActivate={() => circuitInfo.input.block()}
                          onClose   ={() => circuitInfo.input.unblock()} />


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

