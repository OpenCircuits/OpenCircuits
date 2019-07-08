import {IO_PORT_RADIUS,
        IO_PORT_SELECT_RADIUS} from "../Constants";
import {Tool} from "./Tool";
import {CircuitDesigner} from "../../models/CircuitDesigner";
import {Port} from "../../models/ports/Port";
import {InputPort} from "../../models/ports/InputPort";
import {OutputPort} from "../../models/ports/OutputPort";
import {Wire} from "../../models/ioobjects/Wire";

import {CircleContains} from "../math/MathUtils";

import {SelectionTool} from "./SelectionTool";

import {Input} from "../Input";
import {Camera} from "../Camera";

import {Action} from "../actions/Action";
import {ConnectionAction} from "../actions/addition/ConnectionAction";

export class WiringTool extends Tool {

    private designer: CircuitDesigner;
    private camera: Camera;

    private port: Port;

    private wire: Wire;

    private action: ConnectionAction;

    // Keep track of whether or not this tool was
    //  activated by dragging or clicking
    private clicked: boolean;

    public constructor(designer: CircuitDesigner, camera: Camera) {
        super();

        this.designer = designer;
        this.camera = camera;
    }

    public activate(currentTool: Tool, event: string, input: Input): boolean {
        if (!(currentTool instanceof SelectionTool))
            return false;
        if (!(event == "mousedown" || event == "onclick"))
            return false;

        const worldMousePos = this.camera.getWorldPos(input.getMousePos());

        const objects = this.designer.getObjects().reverse();

        // Find a port that was clicked
        const p = objects.reduce((acc, o) => acc = acc.concat(o.getPorts()), [])
                    .find((p) => CircleContains(p.getWorldTargetPos(), IO_PORT_SELECT_RADIUS, worldMousePos));
        if (!p)
            return false;

        // Input ports can only have one input
        // so if one was clicked, then don't
        // start a new wire
        if (p instanceof InputPort &&
            p.getInput() != null)
            return false;

        // Activate
        this.clicked = (event == "onclick");

        this.port = p;
        this.action = undefined;

        // Create wire
        if (p instanceof InputPort) {
            this.wire = new Wire(null, p);
            this.wire.getShape().setP1(p.getWorldTargetPos());
            this.wire.getShape().setC1(p.getWorldTargetPos());
        }
        if (p instanceof OutputPort) {
            this.wire = new Wire(p, null);
            this.wire.getShape().setP2(p.getWorldTargetPos());
            this.wire.getShape().setC2(p.getWorldTargetPos());
        }

        return true;
    }

    public deactivate(event: string): boolean {
        if (this.clicked  && event == "onclick")
            return true;
        if (!this.clicked && event == "mouseup")
            return true;
        return false;
    }

    public onMouseMove(input: Input): boolean {
        const worldMousePos = this.camera.getWorldPos(input.getMousePos());

        // Set one side of curve to mouse position
        const shape = this.wire.getShape();
        if (this.port instanceof InputPort) {
            shape.setP1(worldMousePos);
            shape.setC1(worldMousePos);
        }
        if (this.port instanceof OutputPort) {
            shape.setP2(worldMousePos);
            shape.setC2(worldMousePos);
        }

        return true;
    }

    public onMouseUp(input: Input, _: number): boolean {
        const worldMousePos = this.camera.getWorldPos(input.getMousePos());

        const objects = this.designer.getObjects();
        for (let i = objects.length-1; i >= 0; i--) {
            const obj = objects[i];

            // Check if a port was clicked
            for (const p of obj.getPorts()) {
                if (CircleContains(p.getWorldTargetPos(), IO_PORT_SELECT_RADIUS, worldMousePos)) {
                    // Connect ports
                    if (this.port instanceof InputPort && p instanceof OutputPort)
                        this.action = new ConnectionAction(p, this.port);

                    // Connect ports if not already connected
                    if (this.port instanceof OutputPort && p instanceof InputPort) {
                        // Input ports can only have one input
                        //  so don't connect if it already has one
                        if (p.getInput() != null)
                            return true;

                        this.action = new ConnectionAction(this.port, p);
                    }

                    return true;
                }
            }
        }

        return true;
    }

    public getAction(): Action {
        if (!this.action)
        // if (this.wire.getInput() == undefined || this.wire.getOutput() == undefined)
            return undefined;

        return this.action.execute();
    }

    public getWire(): Wire {
        return this.wire;
    }

}
