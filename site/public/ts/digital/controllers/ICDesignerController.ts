import {IO_PORT_LENGTH,
        IO_PORT_LINE_WIDTH,
        DEFAULT_BORDER_WIDTH} from "digital/utils/Constants";

import {Vector, V} from "Vector";
import {Transform} from "math/Transform";
import {RectContains,
        GetNearestPointOnRect} from "math/MathUtils";
import {Input} from "core/utils/Input";
import {RenderQueue} from "core/utils/RenderQueue";

import {TranslateTool} from "core/tools/TranslateTool";
import {RotateTool} from "core/tools/RotateTool";
import {PlaceComponentTool} from "core/tools/PlaceComponentTool";
import {WiringTool} from "core/tools/WiringTool";

import {ICDesignerView} from "../views/ICDesignerView";

import {ToolManager} from "core/tools/ToolManager";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {IOObject} from "core/models/IOObject";
import {Port} from "core/models/ports/Port";
import {ICData} from "digital/models/ioobjects/other/ICData";
import {IC} from "digital/models/ioobjects/other/IC";

import {ItemNavController} from "./ItemNavController";
import {MainDesignerController} from "../../shared/controllers/MainDesignerController";
import {Selectable} from "core/utils/Selectable";

// Creates a rectangle for the collision box for a port on the IC
//  and determines if the given 'mousePos' is within it
function PortContains(port: Port, mousePos: Vector): boolean {
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

export class ICDesignerController extends MainDesignerController {
    protected designer: DigitalCircuitDesigner;
    protected view: ICDesignerView;

    private icdata: ICData;
    private ic: IC;

    private dragging: boolean;
    private dragPort: Port;
    private dragEdge: "horizontal" | "vertical";

    public constructor() {
        // pass Render function so that
        //  the circuit is redrawn every
        //  time its updated
        super(new DigitalCircuitDesigner(1, () => this.render()),
              new ICDesignerView());

        this.view.setConfirmButtonListener(() => confirm());
        this.view.setCancelButtonListener(() => cancel());

        // Disable some tools
        this.toolManager.disableTool(TranslateTool);
        this.toolManager.disableTool(RotateTool);
        this.toolManager.disableTool(PlaceComponentTool);
        this.toolManager.disableTool(WiringTool);

        // Disable other functionality
        this.toolManager.disableActions();
        this.toolManager.getSelectionTool().disableSelections();

        this.hide();
    }

    private confirm(): void {
        // Add the ICData and IC to the main designer
        const designer = MainDesignerController.GetDesigner();
        designer.addICData(icdata);
        designer.addObject(ic.copy());

        ICDesignerController.Hide();

        // Clear selections and render the main designer
        MainDesignerController.ClearSelections();
        MainDesignerController.Render();
    }

    private cancel(): void {
        this.hide();
    }

    public show(objs: IOObject[]): void {
        this.setActive(true);

        // Create ICData and instance of the IC
        this.icdata = ICData.Create(objs);
        this.ic = new IC(this.icdata);

        // Reset designer and add IC
        this.designer.reset();
        this.designer.addObject(this.ic);

        // Show the view
        this.view.show();

        // Hide and disable ItemNavController
        if (ItemNavController.IsOpen())
            ItemNavController.Toggle();
        ItemNavController.Disable();

        // Render
        this.render();
        MainDesignerController.SetActive(false);
    }

    public hide(): void {
        this.setActive(false);

        this.view.hide();
        ItemNavController.Enable();
        MainDesignerController.SetActive(true);
    }

    protected onMouseDown(button: number): boolean {
        super.onMouseDown(button);

        if (this.dragPort != undefined || this.dragEdge != undefined)
            this.dragging = true;

        return true;
    }

    protected onMouseMove(): boolean {
        super.onMouseMove();

        if (this.dragging)
            return true;

        const worldMousePos = this.getCamera().getWorldPos(this.input.getMousePos());

        // Reset port + edge dragging if we're not dragging
        this.dragPort = undefined;
        this.dragEdge = undefined;

        // Check if a port is being hovered
        const ports = this.ic.getPorts();
        for (let i = 0; i < ports.length; i++) {
            const port = ports[i];
            if (PortContains(port, worldMousePos)) {
                this.dragPort = this.icdata.getPorts()[i];
                this.view.setCursor("move");
                return true;
            }
        }

        // Check if an edge is being hovered
        const t1 = new Transform(this.ic.getPos(), this.ic.getSize().add(V(DEFAULT_BORDER_WIDTH).scale(5)));
        const t2 = new Transform(this.ic.getPos(), this.ic.getSize().sub(V(DEFAULT_BORDER_WIDTH).scale(5)));
        if (RectContains(t1, worldMousePos) &&
           !RectContains(t2, worldMousePos)) {
            if (worldMousePos.y < this.ic.getPos().y + this.ic.getSize().y/2 - 4 &&
                worldMousePos.y > this.ic.getPos().y - this.ic.getSize().y/2 + 4)
                this.dragEdge = "horizontal";
            else
                this.dragEdge = "vertical";
            this.view.setCursor(this.dragEdge == "horizontal" ? "ew-resize" : "ns-resize");
            return true;
        }

        // Reset cursor
        this.view.setCursor("default");

        return true;
    }

    protected onMouseDrag(button: number): boolean {
        super.onMouseDrag(button);

        const worldMousePos = this.getCamera().getWorldPos(this.input.getMousePos());

        if (this.dragging) {
            if (this.dragPort) {
                if (this.ic.isWithinSelectBounds(worldMousePos)) {
                    // TODO: turn switches into little switch icons
                    //  on the surface of the IC and same with LEDs
                } else {
                    const size = this.ic.getSize();
                    const p = GetNearestPointOnRect(size.scale(-0.5), size.scale(0.5), worldMousePos);
                    const v = p.sub(worldMousePos).normalize().scale(size.scale(0.5).sub(V(IO_PORT_LENGTH+size.x/2-25,
                                                                                           IO_PORT_LENGTH+size.y/2-25))).add(p);

                    // Set port for IC
                    this.dragPort.setOriginPos(p);
                    this.dragPort.setTargetPos(v);

                    // Set pos for ICData
                    this.ic.update();
                }
            }
            else if (this.dragEdge) {
                const size = this.icdata.getSize();
                const size2 = worldMousePos.scale(2).abs();

                this.icdata.setSize(V(this.dragEdge == "horizontal" ? size2.x : size.x,
                                      this.dragEdge == "horizontal" ? size.y  : size2.y));

                this.icdata.positionPorts();
                this.ic.update();
            }

            this.render();
        }

        return true;
    }

    protected onMouseUp(button: number): boolean {
        super.onMouseUp(button);

        // Reset dragging
        this.dragging = false;
        this.dragPort = undefined;
        this.dragEdge = undefined;

        return true;
    }

    public getSelections(): Selectable[] {
        return [];
    }
}
