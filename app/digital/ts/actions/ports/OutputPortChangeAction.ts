import {Action} from "core/actions/Action";

import {Port} from "core/models/ports/Port";
import {DigitalComponent} from "digital/models/DigitalComponent";
import {PortChangeAction} from "core/actions/ports/PortChangeAction";

export class OutputPortChangeAction extends PortChangeAction {
    protected obj: DigitalComponent;

    public constructor(obj: DigitalComponent, target: number) {
        super(obj, target, obj.getOutputPorts().length);
    }

    protected getPorts(): Port[] {
        return this.obj.getOutputPorts();
    }

    public execute(): Action {
        super.execute();
        this.obj.setOutputPortCount(this.targetCount);
        return this;
    }

    public undo(): Action {
        this.obj.setOutputPortCount(this.initialCount);
        super.undo();
        return this;
    }

}
