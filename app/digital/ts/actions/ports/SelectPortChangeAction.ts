import {Action} from "core/actions/Action";
import {PortChangeAction} from "core/actions/ports/PortChangeAction";

import {Port} from "core/models/ports/Port";
import {Mux} from "digital/models/ioobjects/other/Mux";
import {Multiplexer} from "digital/models/ioobjects/other/Multiplexer";

import {InputPortChangeAction} from "./InputPortChangeAction";
import {OutputPortChangeAction} from "./OutputPortChangeAction";

export class SelectPortChangeAction extends PortChangeAction {
    protected obj: Mux;

    protected sidePortAction: PortChangeAction;

    public constructor(obj: Mux, target: number) {
        super(obj, target, obj.getSelectPorts().length);

        if (obj instanceof Multiplexer)
            this.sidePortAction = new InputPortChangeAction(obj, Math.pow(2, target));
        else
            this.sidePortAction = new OutputPortChangeAction(obj, Math.pow(2, target));
    }

    protected getPorts(): Port[] {
        return this.obj.getSelectPorts();
    }

    public execute(): Action {
        super.execute();
        this.obj.setSelectPortCount(this.targetCount);
        this.sidePortAction.execute();
        this.obj.setBinaryLabels();
        return this;
    }

    public undo(): Action {
        this.sidePortAction.undo();
        this.obj.setSelectPortCount(this.initialCount);
        super.undo();
        this.obj.setBinaryLabels();
        return this;
    }

}
