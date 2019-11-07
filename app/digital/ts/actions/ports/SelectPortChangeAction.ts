import {Action} from "core/actions/Action";
import {DigitalPortChangeAction} from "./DigitalPortChangeAction";
import {InputPortChangeAction} from "./InputPortChangeAction";

import {Mux} from "digital/models/ioobjects/other/Mux";

export class SelectPortChangeAction extends DigitalPortChangeAction {
    protected obj: Mux;

    protected inputAction: InputPortChangeAction;

    public constructor(obj: Mux, target: number) {
        super(obj, target, obj.getSelectPorts().length);

        this.inputAction = new InputPortChangeAction(obj, Math.pow(2, target));

        this.action = super.createAction(this.obj.getSelectPorts(),
                                         this.targetCount);
    }

    public execute(): Action {
        super.execute();
        this.inputAction.execute();
        this.obj.setSelectPortCount(this.targetCount);
        return this;
    }

    public undo(): Action {
        this.inputAction.undo();
        this.obj.setSelectPortCount(this.initialCount);
        super.undo();
        return this;
    }

}
