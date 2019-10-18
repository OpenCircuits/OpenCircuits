import {IO_PORT_SELECT_RADIUS} from "core/utils/Constants";

import {Camera} from "math/Camera";
import {CircleContains} from "math/MathUtils";

import {Input} from "core/utils/Input";
import {Tool} from "core/tools/Tool";
import {WiringTool} from "core/tools/WiringTool";
import {Action} from "core/actions/Action";
import {ConnectionAction} from "core/actions/addition/ConnectionAction";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {InputPort} from "digital/models/ports/InputPort";
import {OutputPort} from "digital/models/ports/OutputPort";
import {DigitalWire} from "digital/models/DigitalWire";

export class DigitalWiringTool extends WiringTool {
    protected designer: DigitalCircuitDesigner;

    private action: ConnectionAction;

    public constructor(designer: DigitalCircuitDesigner, camera: Camera) {
        super(designer, camera);
    }

    public shouldActivate(currentTool: Tool, event: string, input: Input): boolean {
        if (!super.shouldActivate(currentTool, event, input))
            return false;

        const worldMousePos = this.camera.getWorldPos(input.getMouseDownPos());
        const objects = this.designer.getObjects().reverse();

        const p = this.findPort(objects, worldMousePos);

        // Input ports can only have one input
        // so if one was clicked, then don't
        // start a new wire
        return !(p instanceof InputPort && p.getInput() != null);
    }

    public activate(currentTool: Tool, event: string, input: Input): Action {
        super.activate(currentTool, event, input);

        // Create wire
        if (this.port instanceof InputPort) {
            this.wire = new DigitalWire(null, this.port);
            this.wire.getShape().setP1(this.port.getWorldTargetPos());
            this.wire.getShape().setC1(this.port.getWorldTargetPos());
        }
        if (this.port instanceof OutputPort) {
            this.wire = new DigitalWire(this.port, null);
            this.wire.getShape().setP2(this.port.getWorldTargetPos());
            this.wire.getShape().setC2(this.port.getWorldTargetPos());
        }

        return undefined;
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

        const ports = this.designer.getObjects().reverse()
                // Map objects to ports
                .flatMap((o) => o.getPorts())
                // Filter by the opposite of whatever this.port is
                .filter((p) => (this.port instanceof InputPort ? p instanceof OutputPort : p instanceof InputPort))
                // Filter out InputPort's that already have connections
                .filter((p) => (p instanceof InputPort ? p.getInput() == null : true));

        // Find first port that's being clicked on that isn't this.port
        const port = ports.find((p) => p != this.port && CircleContains(p.getWorldTargetPos(), IO_PORT_SELECT_RADIUS, worldMousePos));

        if (port) {
            // Create action
            this.action = this.port instanceof InputPort ?
                    new ConnectionAction(port, this.port) :
                    new ConnectionAction(this.port, port);
        }

        return true;
    }

    public deactivate(): Action {
        const action = this.action;
        // Reset action
        this.action = undefined;
        return (action ? action.execute() : undefined);
    }

}