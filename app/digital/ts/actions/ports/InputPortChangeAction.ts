import {Action} from "core/actions/Action";
import {DigitalPortChangeAction} from "./DigitalPortChangeAction";

import {DigitalComponent} from "digital/models/DigitalComponent";

export class InputPortChangeAction extends DigitalPortChangeAction {
    public constructor(obj: DigitalComponent, target: number) {
        super(obj, target, obj.getInputPorts().length);

        this.action = super.createAction(this.obj.getInputPorts(),
                                         this.targetCount);
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
