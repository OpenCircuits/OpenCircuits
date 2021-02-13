import {DEFAULT_SIZE} from "core/utils/Constants";

import {V} from "Vector";

import {Action} from "core/actions/Action";
import {PortChangeAction} from "core/actions/ports/PortChangeAction";

import {Port} from "core/models/ports/Port";
import {Mux} from "digital/models/ioobjects/other/Mux";
import {Multiplexer} from "digital/models/ioobjects/other/Multiplexer";

import {InputPortChangeAction} from "./InputPortChangeAction";
import {OutputPortChangeAction} from "./OutputPortChangeAction";

export class MuxPortChangeAction extends PortChangeAction {
    protected obj: Mux;

    protected otherPortAction: PortChangeAction;

    public constructor(obj: Mux, initial: number, target: number) {
        super(obj.getDesigner(), target, initial);
        this.obj = obj;

        if (obj instanceof Multiplexer)
            this.otherPortAction = new InputPortChangeAction(obj, initial, Math.pow(2, target));
        else
            this.otherPortAction = new OutputPortChangeAction(obj, initial, Math.pow(2, target));
    }

    protected changeSize(val: number): void {
        const width = Math.max(DEFAULT_SIZE/2*(val-1), DEFAULT_SIZE);
        const height = DEFAULT_SIZE/2*Math.pow(2, val);
        this.obj.setSize(V(width+10, height));
    }

    protected getPorts(): Port[] {
        return this.obj.getSelectPorts();
    }

    public execute(): Action {
        // Change size first
        this.changeSize(this.targetCount);

        super.execute();
        this.otherPortAction.execute();
        this.obj.setSelectPortCount(this.targetCount);
        return this;
    }

    public undo(): Action {
        // Change size back first
        this.changeSize(this.initialCount);

        this.obj.setSelectPortCount(this.initialCount);
        this.otherPortAction.undo();
        super.undo();
        return this;
    }

}
