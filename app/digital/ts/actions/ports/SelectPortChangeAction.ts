import {Action} from "core/actions/Action";
import {PortChangeAction} from "core/actions/ports/PortChangeAction";

import {Port} from "core/models/ports/Port";
import {Mux} from "digital/models/ioobjects/other/Mux";

import {InputPortChangeAction} from "./InputPortChangeAction";

export class SelectPortChangeAction extends PortChangeAction {
    protected obj: Mux;

    protected inputAction: InputPortChangeAction;

    public constructor(obj: Mux, target: number) {
        super(obj, target, obj.getSelectPorts().length);

        this.inputAction = new InputPortChangeAction(obj, Math.pow(2, target));
    }

    protected getPorts(): Port[] {
        return this.obj.getSelectPorts();
    }

    public execute(): Action {
        super.execute();
        this.inputAction.execute();
        this.obj.setSelectPortCount(this.targetCount);
        return this;
    }

    public undo(): Action {
        this.obj.setSelectPortCount(this.initialCount);
        this.inputAction.undo();
        super.undo();
        return this;
    }

}
