import {Action} from "core/actions/Action";
import {PortChangeAction} from "core/actions/ports/PortChangeAction";

import {Component} from "core/models/Component";

export class InputPortChangeAction extends PortChangeAction {
    public constructor(obj: Component, target: number) {
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
