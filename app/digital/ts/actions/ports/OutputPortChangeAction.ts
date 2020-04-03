import {Action} from "core/actions/Action";

import {Port} from "core/models/ports/Port";
import {DigitalComponent} from "digital/models/DigitalComponent";
import {PortChangeAction} from "core/actions/ports/PortChangeAction";
import {InputPortChangeAction} from "digital/actions/ports/InputPortChangeAction";

import {Encoder} from "digital/models/ioobjects/other/Encoder";

export class OutputPortChangeAction extends PortChangeAction {
    protected obj: DigitalComponent;

    protected inputAction: InputPortChangeAction;

    public constructor(obj: DigitalComponent, target: number) {
        super(obj, target, obj.getOutputPorts().length);
        if (obj instanceof Encoder)
            this.inputAction = new InputPortChangeAction(obj, Math.pow(2, target));
    }

    protected getPorts(): Port[] {
        return this.obj.getOutputPorts();
    }

    public execute(): Action {
        super.execute();
        if (this.inputAction != null)
            this.inputAction.execute();
        this.obj.setOutputPortCount(this.targetCount);
        return this;
    }

    public undo(): Action {
        this.obj.setOutputPortCount(this.initialCount);
        if (this.inputAction != null)
            this.inputAction.undo();
        super.undo();
        return this;
    }

}
