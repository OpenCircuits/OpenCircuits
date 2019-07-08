import {IO_PORT_LENGTH,
        IO_PORT_LINE_WIDTH,
        DEFAULT_BORDER_WIDTH} from "../utils/Constants";

import {Vector, V} from "../utils/math/Vector";
import {Transform} from "../utils/math/Transform";
import {RectContains,
        GetNearestPointOnRect} from "../utils/math/MathUtils";
import {Input} from "../utils/Input";
import {RenderQueue} from "../utils/RenderQueue";

import {TranslateTool} from "../utils/tools/TranslateTool";
import {RotateTool} from "../utils/tools/RotateTool";
import {PlaceComponentTool} from "../utils/tools/PlaceComponentTool";
import {WiringTool} from "../utils/tools/WiringTool";

import {CircuitDesigner} from "../models/CircuitDesigner";

import {ICDesignerView} from "../views/ICDesignerView";

import {ToolManager} from "../utils/tools/ToolManager";

import {IOObject} from "../models/ioobjects/IOObject";
import {Port} from "../models/ports/Port";
import {ICData} from "../models/ioobjects/other/ICData";
import {IC} from "../models/ioobjects/other/IC";

import {ItemNavController} from "./ItemNavController";
import {MainDesignerController} from "./MainDesignerController";

export const ICDesignerController = (() => {
    let designer: CircuitDesigner;
    let view: ICDesignerView;
    let input: Input;

    let toolManager: ToolManager;
    let renderQueue: RenderQueue;

    let icdata: ICData;
    let ic: IC;

    let dragging: boolean = false;
    let dragPort: Port = undefined;
    let dragEdge: "horizontal" | "vertical" = undefined;

    // Creates a rectangle for the collision box for a port on the IC
    //  and determines if the given 'mousePos' is within it
    const portContains = function(port: Port, mousePos: Vector): boolean {
        const origin = port.getOriginPos();
        const target = port.getTargetPos();

        // Get properties of collision box
        const pos   = target.add(origin).scale(0.5);
        const size  = V(target.sub(origin).len(), IO_PORT_LINE_WIDTH*2);
        const angle = target.sub(origin).angle();

        const rect  = new Transform(pos, size, angle);
        rect.setParent(port.getParent().getTransform());

        return RectContains(rect, mousePos);
    }

    const resize = function(): void {
        view.resize();

        ICDesignerController.Render();
    }

    const onMouseDown = function(button: number): void {
        if (toolManager.onMouseDown(input, button))
            ICDesignerController.Render();

        if (dragPort != undefined || dragEdge != undefined)
            dragging = true;
    }

    const onMouseMove = function(): void {
        if (toolManager.onMouseMove(input))
            ICDesignerController.Render();

        if (dragging)
            return;

        const worldMousePos = view.getCamera().getWorldPos(input.getMousePos());

        // Reset port + edge dragging if we're not dragging
        dragPort = undefined;
        dragEdge = undefined;

        // Check if a port is being hovered
        const ports = ic.getPorts();
        for (let i = 0; i < ports.length; i++) {
            const port = ports[i];
            if (portContains(port, worldMousePos)) {
                dragPort = icdata.getPorts()[i];
                view.setCursor("move");
                return;
            }
        }

        // Check if an edge is being hovered
        const t1 = new Transform(ic.getPos(), ic.getSize().add(V(DEFAULT_BORDER_WIDTH, DEFAULT_BORDER_WIDTH).scale(5)));
        const t2 = new Transform(ic.getPos(), ic.getSize().sub(V(DEFAULT_BORDER_WIDTH, DEFAULT_BORDER_WIDTH).scale(5)));
        if (RectContains(t1, worldMousePos) &&
           !RectContains(t2, worldMousePos)) {
            if (worldMousePos.y < ic.getPos().y + ic.getSize().y/2 - 4 &&
                worldMousePos.y > ic.getPos().y - ic.getSize().y/2 + 4)
                dragEdge = "horizontal";
            else
                dragEdge = "vertical";
            view.setCursor(dragEdge == "horizontal" ? "ew-resize" : "ns-resize");
            return;
        }

        // Reset cursor
        view.setCursor("default");
    }

    const onMouseDrag = function(button: number): void {
        if (toolManager.onMouseDrag(input, button))
            ICDesignerController.Render();

        const worldMousePos = view.getCamera().getWorldPos(input.getMousePos());

        if (dragging) {
            if (dragPort) {
                if (ic.isWithinSelectBounds(worldMousePos)) {
                    // TODO: turn switches into little switch icons
                    //  on the surface of the IC and same with LEDs
                } else {
                    const size = ic.getSize();
                    const p = GetNearestPointOnRect(size.scale(-0.5), size.scale(0.5), worldMousePos);
                    const v = p.sub(worldMousePos).normalize().scale(size.scale(0.5).sub(V(IO_PORT_LENGTH+size.x/2-25, IO_PORT_LENGTH+size.y/2-25))).add(p);

                    // Set port for IC
                    dragPort.setOriginPos(p);
                    dragPort.setTargetPos(v);

                    // Set pos for ICData
                    ic.update();
                }
            }
            else if (dragEdge) {
                const size = icdata.getSize();
                const size2 = worldMousePos.scale(2).abs();

                icdata.setSize(V(dragEdge == "horizontal" ? size2.x : size.x,
                                 dragEdge == "horizontal" ? size.y  : size2.y));

                icdata.positionPorts();
                ic.update();
            }

            ICDesignerController.Render();
        }
    }

    const onMouseUp = function(button: number): void {
        if (toolManager.onMouseUp(input, button))
            ICDesignerController.Render();

        // Reset dragging
        dragging = false;
        dragPort = undefined;
        dragEdge = undefined;
    }

    const onClick = function(button: number): void {
        if (toolManager.onClick(input, button))
            ICDesignerController.Render();
    }

    const onKeyDown = function(key: number): void {
        if (toolManager.onKeyDown(input, key))
            ICDesignerController.Render();
    }

    const onKeyUp = function(key: number): void {
        if (toolManager.onKeyUp(input, key))
            ICDesignerController.Render();
    }

    const onZoom = function(zoom: number, center: Vector): void {
        view.getCamera().zoomTo(center, zoom);

        ICDesignerController.Render();
    }

    const confirm = function(): void {
        // Add the ICData and IC to the main designer
        const designer = MainDesignerController.GetDesigner();
        designer.addICData(icdata);
        designer.addObject(ic.copy());

        ICDesignerController.Hide();

        // Clear selections and render the main designer
        MainDesignerController.ClearSelections();
        MainDesignerController.Render();
    }

    const cancel = function(): void {
        ICDesignerController.Hide();
    }

    return {
        Init: function(): void {
            // pass Render function so that
            //  the circuit is redrawn every
            //  time its updated
            designer = new CircuitDesigner(1, () => this.Render());
            view = new ICDesignerView();

            view.setConfirmButtonListener(() => confirm());
            view.setCancelButtonListener(() => cancel());

            // utils
            toolManager = new ToolManager(view.getCamera(), designer);
            renderQueue = new RenderQueue(() =>
                view.render(designer,
                            [], toolManager));

            // Disable some tools
            toolManager.disableTool(TranslateTool);
            toolManager.disableTool(RotateTool);
            toolManager.disableTool(PlaceComponentTool);
            toolManager.disableTool(WiringTool);

            // Disable other functionality
            toolManager.disableActions();
            toolManager.getSelectionTool().disableSelections();

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
        },
        Render: function(): void {
            renderQueue.render();
        },
        Show: function(objs: Array<IOObject>): void {
            // Create ICData and instance of the IC
            icdata = ICData.Create(objs);
            ic = new IC(icdata);

            // Reset designer and add IC
            designer.reset();
            designer.addObject(ic);

            // Show the view
            view.show();

            // Hide and disable ItemNavController
            if (ItemNavController.IsOpen())
                ItemNavController.Toggle();
            ItemNavController.Disable();

            // Render
            ICDesignerController.Render();
        },
        Hide: function(): void {
            view.hide();
            ItemNavController.Enable();
        }
    };
})();
