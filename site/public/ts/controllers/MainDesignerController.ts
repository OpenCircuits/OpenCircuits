import {Vector} from "../utils/math/Vector";

import {Camera} from "../utils/Camera";
import {Input} from "../utils/Input";
import {RenderQueue} from "../utils/RenderQueue";
import {Selectable} from "../utils/Selectable";

import {Action} from "../utils/actions/Action";
import {CreateDeselectAllAction} from "../utils/actions/selection/SelectAction";

import {CircuitDesigner} from "../models/CircuitDesigner";

import {MainDesignerView} from "../views/MainDesignerView";

import {Tool} from "../utils/tools/Tool";
import {ToolManager} from "../utils/tools/ToolManager";
import {SelectionTool} from "../utils/tools/SelectionTool";
import {TranslateTool} from "../utils/tools/TranslateTool";
import {RotateTool} from "../utils/tools/RotateTool";
import {PlaceComponentTool} from "../utils/tools/PlaceComponentTool";
import {WiringTool} from "../utils/tools/WiringTool";

import {Component} from "../models/ioobjects/Component";
import {SelectionPopupController} from "./SelectionPopupController";


export const MainDesignerController = (() => {
    let active = true;

    let designer: CircuitDesigner;
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
            designer = new CircuitDesigner(1, () => this.Render());
            view = new MainDesignerView();

            // utils
            toolManager = new ToolManager(view.getCamera(), designer);
            renderQueue = new RenderQueue(() =>
                view.render(designer,
                            toolManager.getSelectionTool().getSelections(),
                            toolManager));

            // input
            input = new Input(view.getCanvas());
            input.addListener("click",     (b) => !active || onClick(b));
            input.addListener("mousedown", (b) => !active || onMouseDown(b));
            input.addListener("mousedrag", (b) => !active || onMouseDrag(b));
            input.addListener("mousemove", ( ) => !active || onMouseMove());
            input.addListener("mouseup",   (b) => !active || onMouseUp(b));
            input.addListener("keydown",   (b) => !active || onKeyDown(b));
            input.addListener("keyup",     (b) => !active || onKeyUp(b));
            input.addListener("zoom",    (z,c) => !active || onZoom(z,c));

            window.addEventListener("resize", _e => resize(), false);

            toolManager.getSelectionTool().addSelectionChangeListener( () => SelectionPopupController.Update() );
        },
        Render: function(): void {
            renderQueue.render();
        },
        ClearSelections: function(): void {
            MainDesignerController.AddAction(CreateDeselectAllAction(toolManager.getSelectionTool()).execute());
        },
        PlaceComponent: function(component: Component, instant: boolean = false): void {
            toolManager.placeComponent(component, instant);
        },
        AddAction: function(action: Action): void {
            toolManager.addAction(action);
        },
        SetActive: function(on: boolean): void {
            active = on;
        },
        SetEditMode: function(val: boolean): void {
            // Disable some tools
            toolManager.disableTool(TranslateTool, val);
            toolManager.disableTool(RotateTool, val);
            toolManager.disableTool(PlaceComponentTool, val);
            toolManager.disableTool(WiringTool, val);

            // Disable actions/selections
            toolManager.disableActions(val);
            MainDesignerController.ClearSelections();
            toolManager.getSelectionTool().disableSelections(val);

            MainDesignerController.Render();
        },
        GetSelections: function(): Array<Selectable> {
            return toolManager.getSelectionTool().getSelections();
        },
        GetCurrentTool: function(): Tool {
            return toolManager.getCurrentTool();
        },
        GetSelectionTool: function(): SelectionTool {
            return toolManager.getSelectionTool();
        },
        GetCanvas: function(): HTMLCanvasElement {
            return view.getCanvas();
        },
        GetCamera: function(): Camera {
            return view.getCamera();
        },
        GetDesigner: function(): CircuitDesigner {
            return designer;
        },
        IsActive: function(): boolean {
            return active;
        }
    };
})();
