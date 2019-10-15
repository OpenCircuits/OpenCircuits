import {IO_PORT_SELECT_RADIUS} from "core/utils/Constants";
import {Tool} from "core/tools/Tool";
import {Port} from "core/models/ports/Port";

import {Wire} from "core/models/Wire";

import {CircleContains} from "math/MathUtils";
import {Camera} from "math/Camera";

import {SelectionTool} from "core/tools/SelectionTool";

import {Input} from "core/utils/Input";

import {Action} from "core/actions/Action";
import {ConnectionAction} from "core/actions/addition/ConnectionAction";
import {AnalogCircuitDesigner} from "analog/models/AnalogCircuitDesigner";
import {AnalogWire} from "analog/models/AnalogWire";

export class WiringTool extends Tool {
    private designer: AnalogCircuitDesigner;
    private camera: Camera;

    private port: Port;

    private wire: Wire;

    private action: ConnectionAction;

    // Keep track of whether or not this tool was
    //  activated by dragging or clicking
    private clicked: boolean;

    public constructor(designer: AnalogCircuitDesigner, camera: Camera) {
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

        // Activate
        this.clicked = (event == "onclick");

        this.port = p;
        this.action = undefined;

        // Create wire
        this.wire = new AnalogWire(p, null);
        // this.wire.getShape().setP1(p.getWorldTargetPos());
        // this.wire.getShape().setC1(p.getWorldTargetPos());

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
        shape.setP2(worldMousePos);
        shape.setC2(worldMousePos);

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
                    if (this.port != p)
                        this.action = new ConnectionAction(this.port, p);

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
