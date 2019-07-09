import {Vector} from "../utils/math/Vector";

import {Camera} from "../utils/Camera";
import {Input} from "../utils/Input";
import {RenderQueue} from "../utils/RenderQueue";

import {Action} from "../utils/actions/Action";

import {CircuitDesigner} from "../models/CircuitDesigner";

import {MainDesignerView} from "../views/MainDesignerView";

import {ToolManager} from "../utils/tools/ToolManager";
import {TranslateTool} from "../utils/tools/TranslateTool";
import {RotateTool} from "../utils/tools/RotateTool";
import {PlaceComponentTool} from "../utils/tools/PlaceComponentTool";
import {WiringTool} from "../utils/tools/WiringTool";

import {IOObject} from "../models/ioobjects/IOObject";
import {Component} from "../models/ioobjects/Component";
import {Port} from "../models/ports/Port";
import {SelectionPopupController} from "./SelectionPopupController";
import {Circuit} from "../models/Circuit";
import {Importer} from "../utils/io/Importer";
import {SideNavController} from "./SideNavController";
import {HeaderController} from "./HeaderController";
import {CircuitMetadata} from "../models/CircuitMetadata";
import {Exporter} from "../utils/io/Exporter";
import {RemoteCircuitController} from "./RemoteCircuitController";

export const MainDesignerController = (() => {
    let circuit: Circuit;
    let view: MainDesignerView;
    let input: Input;

    let toolManager: ToolManager;
    let renderQueue: RenderQueue;

    const resize = function(): void {
        view.resize();

        MainDesignerController.Render();
    }

    const onMouseDown = function(button: number): void {
        if (toolManager.onMouseDown(input, button))
            MainDesignerController.Render();
    }

    const onMouseMove = function(): void {
        if (toolManager.onMouseMove(input))
            MainDesignerController.Render();
    }

    const onMouseDrag = function(button: number): void {
        if (toolManager.onMouseDrag(input, button)) {
            SelectionPopupController.Hide();
            MainDesignerController.Render();
        }
    }

    const onMouseUp = function(button: number): void {
        if (toolManager.onMouseUp(input, button)) {
            SelectionPopupController.Update();
            MainDesignerController.Render();
        }
    }

    const onClick = function(button: number): void {
        if (toolManager.onClick(input, button)) {
            SelectionPopupController.Update();
            MainDesignerController.Render();
        }
    }

    const onKeyDown = function(key: number): void {
        if (toolManager.onKeyDown(input, key)) {
            SelectionPopupController.Update();
            MainDesignerController.Render();
        }
    }

    const onKeyUp = function(key: number): void {
        if (toolManager.onKeyUp(input, key))
            MainDesignerController.Render();
    }

    const onZoom = function(zoom: number, center: Vector): void {
        view.getCamera().zoomTo(center, zoom);

        SelectionPopupController.Update();
        MainDesignerController.Render();
    }

    return {
        Init: function(): void {
            // pass Render function so that
            //  the circuit is redrawn every
            //  time its updated
            circuit = new Circuit();
            circuit.designer = new CircuitDesigner(1, () => this.Render());
            view = new MainDesignerView();

            // This could be better
            let defaultInterval = 5000;
            let interval = defaultInterval;
            setTimeout(function update() {
                MainDesignerController.PushCircuit()
                    .then(() => {
                        setTimeout(update, interval = defaultInterval);
                    })
                    .catch((reason) => {
                        console.log(reason);
                        // Use exponential backoff
                        setTimeout(update, interval *= 1.3);
                    });
            }, interval);

            // utils
            toolManager = new ToolManager(view.getCamera(), circuit.designer);
            renderQueue = new RenderQueue(() =>
                view.render(circuit.designer,
                            toolManager.getSelectionTool().getSelections(),
                            toolManager.getSelectionTool().getPortSelections(),
                            toolManager));

            // input
            input = new Input(view.getCanvas());
            input.addListener("click",     (b) => onClick(b));
            input.addListener("mousedown", (b) => onMouseDown(b));
            input.addListener("mousedrag", (b) => onMouseDrag(b));
            input.addListener("mousemove", ( ) => onMouseMove());
            input.addListener("mouseup",   (b) => onMouseUp(b));
            input.addListener("keydown",   (b) => onKeyDown(b));
            input.addListener("keyup",     (b) => onKeyUp(b));
            input.addListener("zoom",    (z,c) => onZoom(z,c));

            window.addEventListener("resize", _e => resize(), false);

            toolManager.getSelectionTool().addSelectionChangeListener( () => SelectionPopupController.Update() );
        },
        Render: function(): void {
            renderQueue.render();
        },
        ClearSelections: function(): void {
            toolManager.getSelectionTool().clearSelections();
        },
        PlaceComponent: function(component: Component, instant: boolean = false): void {
            toolManager.placeComponent(component, instant);
        },
        AddAction: function(action: Action): void {
            toolManager.addAction(action);
        },
        SetEditMode: function(val: boolean): void {
            // Disable some tools
            toolManager.disableTool(TranslateTool, val);
            toolManager.disableTool(RotateTool, val);
            toolManager.disableTool(PlaceComponentTool, val);
            toolManager.disableTool(WiringTool, val);

            // Disable actions/selections
            toolManager.disableActions(val);
            toolManager.getSelectionTool().clearSelections();
            toolManager.getSelectionTool().disableSelections(val);

            MainDesignerController.Render();
        },
        GetSelections: function(): Array<IOObject> {
            return toolManager.getSelectionTool().getSelections();
        },
        GetPortSelections: function(): Array<Port> {
            return toolManager.getSelectionTool().getPortSelections();
        },
        GetCanvas: function(): HTMLCanvasElement {
            return view.getCanvas();
        },
        GetCamera: function(): Camera {
            return view.getCamera();
        },
        GetDesigner: function(): CircuitDesigner {
            return circuit.designer;
        },
        GetCircuit: function(): Circuit {
            return circuit;
        },
        FetchCircuit: function(id: string): Promise<Circuit> {
            return RemoteCircuitController.LoadCircuit(circuit, id)
                .then((metadata) => {
                    HeaderController.UpdateName(metadata.getName());
                })
                .catch((reason) => {
                    alert("Failed to pull circuit from server: " + reason);
                })
                .then(() => {
                    return circuit;
                });
        },
        PushCircuit: function(): Promise<any> {
            // TODO: streamline and expand in-progress and other status indicators
            HeaderController.SavingInProgress();
            return RemoteCircuitController.PushCircuit(circuit)
                .catch((reason) => {
                    alert("Failed to push circuit to server: " + reason);
                })
                .then(() => {
                    HeaderController.SavingComplete();
                });
        },
        NewCircuit: function() {
            MainDesignerController.PushCircuit().then(() => {
                HeaderController.UpdateName("Untitled Circuit*");
                circuit.metadata = new CircuitMetadata();
                circuit.designer.reset();
                renderQueue.render();
            });
        }
    };
})();
