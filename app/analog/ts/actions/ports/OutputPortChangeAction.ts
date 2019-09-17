import {Action} from "../Action";
import {PortChangeAction} from "./PortChangeAction";

import {EEComponent} from "analog/models/eeobjects/EEComponent";

export class OutputPortChangeAction extends PortChangeAction {
    public constructor(obj: EEComponent, target: number) {
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
