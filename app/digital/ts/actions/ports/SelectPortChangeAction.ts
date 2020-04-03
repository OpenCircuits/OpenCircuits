import {Action} from "core/actions/Action";
import {PortChangeAction} from "core/actions/ports/PortChangeAction";

import {Port} from "core/models/ports/Port";
import {Mux} from "digital/models/ioobjects/other/Mux";

import {InputPortChangeAction} from "./InputPortChangeAction";
import {OutputPortChangeAction} from "./OutputPortChangeAction";
import {Multiplexer} from "digital/models/ioobjects";

export class SelectPortChangeAction extends PortChangeAction {
    protected obj: Mux;

    protected sidePortAction: PortChangeAction;

    public constructor(obj: Mux, target: number) {
        super(obj, target, obj.getSelectPorts().length);

        if (Mux instanceof Multiplexer)
            this.sidePortAction = new InputPortChangeAction(obj, Math.pow(2, target));
        else
            this.sidePortAction = new OutputPortChangeAction(obj, Math.pow(2, target));
    }

    protected getPorts(): Port[] {
        return this.obj.getSelectPorts();
    }

    public execute(): Action {
        super.execute();
        this.sidePortAction.execute();
        this.obj.setSelectPortCount(this.targetCount);
        return this;
    }

    public undo(): Action {
        this.obj.setSelectPortCount(this.initialCount);
        this.sidePortAction.undo();
        super.undo();
        return this;
    }

}
