import {Action} from "core/actions/Action";

import {Port} from "core/models/ports/Port";
import {DigitalComponent} from "digital/models/DigitalComponent";
import {PortChangeAction} from "core/actions/ports/PortChangeAction";

export class InputPortChangeAction extends PortChangeAction {
    protected obj: DigitalComponent;

    public constructor(obj: DigitalComponent, target: number) {
        super(obj, target, obj.getInputPorts().length);
    }

    protected getPorts(): Port[] {
        return this.obj.getInputPorts();
    }

    public execute(): Action {
        super.execute();
        this.obj.setInputPortCount(this.targetCount);
        return this;
    }

    public undo(): Action {
        this.obj.setInputPortCount(this.initialCount);
        super.undo();
        return this;
    }

}
