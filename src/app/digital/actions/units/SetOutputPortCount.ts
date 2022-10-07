import {Action} from "core/actions/Action";

import {PortChangeAction} from "core/actions/bases/PortChangeAction";

import {Port} from "core/models/ports/Port";

import {DigitalComponent} from "digital/models/DigitalComponent";


/**
 * This code allows for the change in the number of output ports on a DigitalComponent.
 */
class OutputPortChangeAction extends PortChangeAction<DigitalComponent> {
    /**
     * This code constructs the obj with the new number of ports.
     *
     * @param obj    The object being changed.
     * @param target Number of ports.
     */
    public constructor(obj: DigitalComponent, target: number) {
        super(obj.getDesigner(), obj, target);

        this.execute();
    }

    /**
     * Returns the objects output ports.
     *
     * @returns The objects output inports.
     */
    protected getPorts(): Port[] {
        return this.obj.getOutputPorts();
    }

    /**
     * Changes the number of output ports on the object to the target count.
     *
     * @returns The object with the new number of ports.
     */
    public override execute(): Action {
        super.execute();
        this.obj.setOutputPortCount(this.targetCount);
        return this;
    }

    /**
     * Resets the number of output ports back to the initial count.
     *
     * @returns The object with the initial number of ports.
     */
    public override undo(): Action {
        this.obj.setOutputPortCount(this.initialCount);
        super.undo();
        return this;
    }

    public override getName(): string {
        return "Outport Change";
    }
}

export function SetOutputPortCount(obj: DigitalComponent, target: number) {
    return new OutputPortChangeAction(obj, target);
}
