import {Action} from "../Action";
import {PortChangeAction} from "./PortChangeAction";

import {EEComponent} from "analog/models/eeobjects/EEComponent";

export class InputPortChangeAction extends PortChangeAction {
    public constructor(obj: EEComponent, target: number) {
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
