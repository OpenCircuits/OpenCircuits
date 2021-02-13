import {IO_PORT_SELECT_RADIUS} from "core/utils/Constants";

import {Camera} from "math/Camera";
import {CircleContains} from "math/MathUtils";

import {Input} from "core/utils/Input";
import {Tool} from "core/tools/Tool";
import {WiringTool} from "core/tools/WiringTool";
import {Action} from "core/actions/Action";
import {ConnectionAction} from "core/actions/addition/ConnectionAction";

import {AnalogCircuitDesigner} from "analog/models/AnalogCircuitDesigner";
import {AnalogWire} from "analog/models/AnalogWire";
import {AnalogPort} from "analog/models/ports/AnalogPort";

export class AnalogWiringTool extends WiringTool {
    protected designer: AnalogCircuitDesigner;

    private action: ConnectionAction;

    public constructor(designer: AnalogCircuitDesigner, camera: Camera) {
        super(designer, camera);
    }

    public activate(currentTool: Tool, event: string, input: Input): Action {
        super.activate(currentTool, event, input);

        if (!(this.port instanceof AnalogPort))
            throw new Error("Port is not an analog port in AnalogWiringTool!");

        // Create wire
        this.wire = new AnalogWire(this.port, null);

        const worldMousePos = this.camera.getWorldPos(input.getMousePos());

        this.wire.getShape().setP2(worldMousePos);
        this.wire.getShape().setC2(worldMousePos);

        return undefined;
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

        // Get all ports
        const ports = this.designer.getObjects().flatMap((o) => o.getPorts());

        // Find first port that's being clicked on that isn't this.port
        const port = ports.find((p) => p != this.port && CircleContains(p.getWorldTargetPos(), IO_PORT_SELECT_RADIUS, worldMousePos));

        if (port)
            this.action = new ConnectionAction(this.port, port);

        return true;
    }

    public deactivate(): Action {
        const action = this.action;
        // Reset action
        this.action = undefined;
        return (action ? action.execute() : undefined);
    }

}
