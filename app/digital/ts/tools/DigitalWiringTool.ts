import {Camera} from "math/Camera";

import {Input} from "core/utils/Input";
import {Tool} from "core/tools/Tool";
import {WiringTool} from "core/tools/WiringTool";
import {Action} from "core/actions/Action";
import {ConnectionAction} from "core/actions/addition/ConnectionAction";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {InputPort} from "digital/models/ports/InputPort";
import {OutputPort} from "digital/models/ports/OutputPort";
import {DigitalWire} from "digital/models/DigitalWire";
import {CircleContains} from "math/MathUtils";
import {IO_PORT_SELECT_RADIUS} from "core/utils/Constants";

export class DigitalWiringTool extends WiringTool {
    protected designer: DigitalCircuitDesigner;

    private action: ConnectionAction;

    public constructor(designer: DigitalCircuitDesigner, camera: Camera) {
        super(designer, camera);
    }

    public shouldActivate(currentTool: Tool, event: string, input: Input): boolean {
        if (!this.shouldActivate(currentTool, event, input))
            return false;

        const worldMousePos = this.camera.getWorldPos(input.getMousePos());
        const objects = this.designer.getObjects().reverse();

        const p = this.findPort(objects, worldMousePos);

        // Input ports can only have one input
        // so if one was clicked, then don't
        // start a new wire
        return (p instanceof InputPort && p.getInput() != null);
    }

    public activate(currentTool: Tool, event: string, input: Input): Action {
        super.activate(currentTool, event, input);

        // Create wire
        if (this.port instanceof InputPort) {
            this.wire = new DigitalWire(null, p);
            this.wire.getShape().setP1(p.getWorldTargetPos());
            this.wire.getShape().setC1(p.getWorldTargetPos());
        }
        if (this.port instanceof OutputPort) {
            this.wire = new DigitalWire(p, null);
            this.wire.getShape().setP2(p.getWorldTargetPos());
            this.wire.getShape().setC2(p.getWorldTargetPos());
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

        const ports = this.designer.getObjects()
                // Map objects to ports
                .flatMap((o) => o.getPorts())
                // Filter by the opposite of whatever this.port is
                .filter((p) => (this.port instanceof InputPort ? p instanceof OutputPort : p instanceof InputPort))
                // Filter out InputPort's that already have connections
                .filter((p) => (p instanceof InputPort ? p.getInput() != null : true));

        // Find first port that's being clicked on
        const port = ports.find((p) => CircleContains(p.getWorldTargetPos(), IO_PORT_SELECT_RADIUS, worldMousePos));

        if (port) {
            // Create action
            this.action = this.port instanceof InputPort ?
                    new ConnectionAction(port, this.port) :
                    new ConnectionAction(this.port, port);
        }

        return true;
    }

    public deactivate(event: string, input: Input, button?: number): Action {
        return this.action.execute();
    }

}