import {Vector} from "Vector";
import {Camera} from "math/Camera";

import {Tool} from "core/tools/Tool";
import {SelectionTool} from "core/tools/SelectionTool";

import {Action} from "core/actions/Action";
import {Component} from "core/models/Component";

import {Input} from "core/utils/Input";

import {CircuitDesigner} from "core/models/CircuitDesigner";
import {Port} from "core/models/ports/Port";
import {Wire} from "core/models/Wire";

export class WiringTool extends Tool {
    protected designer: CircuitDesigner;
    protected camera: Camera;

    protected port: Port;

    protected wire: Wire;

    // Keep track of whether or not this tool was
    //  activated by dragging or clicking
    private clicked: boolean;

    public constructor(designer: CircuitDesigner, camera: Camera) {
        super();

        this.designer = designer;
        this.camera = camera;
    }

    protected findPort(objects: Component[], pos: Vector): Port {
        return objects.flatMap((o) => o.getPorts()).find(p => p.isWithinSelectBounds(pos));
    }

    public shouldActivate(currentTool: Tool, event: string, input: Input): boolean {
        if (!(currentTool instanceof SelectionTool))
            return false;

        // Activate if dragged from port or click on the port
        if (!((event == "mousedrag" && input.getTouchCount() == 1) || event == "onclick"))
            return false;

        const worldMousePos = this.camera.getWorldPos(input.getMouseDownPos());
        const objects = this.designer.getObjects().reverse();

        // Make sure a port is being clicked
        return this.findPort(objects, worldMousePos) != undefined;
    }

    public activate(currentTool: Tool, event: string, input: Input): Action {
        if (!(currentTool instanceof SelectionTool))
            throw new Error("Tool not selection tool!");

        const worldMousePos = this.camera.getWorldPos(input.getMouseDownPos());
        const objects = this.designer.getObjects().reverse();

        this.port = this.findPort(objects, worldMousePos);
        this.clicked = (event == "onclick");

        return undefined;
    }

    public shouldDeactivate(event: string): boolean {
        if (this.clicked  && event == "onclick")
            return true;
        if (!this.clicked && event == "mouseup")
            return true;
        return false;
    }

    public getWire(): Wire {
        return this.wire;
    }

}
