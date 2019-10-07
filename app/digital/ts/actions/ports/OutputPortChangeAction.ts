import {Action} from "core/actions/Action";
import {DigitalPortChangeAction} from "./DigitalPortChangeAction";

import {DigitalComponent} from "digital/models/DigitalComponent";

export class OutputPortChangeAction extends DigitalPortChangeAction {
    public constructor(obj: DigitalComponent, target: number) {
        super(obj, target, obj.getOutputPorts().length);

        this.action = super.createAction(this.obj.getOutputPorts(),
                                         this.targetCount);
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
