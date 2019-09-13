import {Action} from "../Action";
import {GroupAction} from "../GroupAction";
import {PortChangeAction} from "./PortChangeAction";

import {Mux} from "../../../models/ioobjects/other/Mux";

export class SelectPortChangeAction extends PortChangeAction {
    public constructor(obj: Mux, target: number) {
        super(obj, target, obj.getSelectPorts().length);

        const group = new GroupAction();

        // Remove select ports
        group.add(super.createAction(obj.getSelectPorts(),
                                     this.targetCount));

        // Remove actual input ports
        //  slice to get just the regular input ports, not the select ports1
        group.add(super.createAction(obj.getInputPorts().slice(0, -obj.numSelects()),
                                     Math.pow(2, this.targetCount)));

        this.action = group;
    }

    public execute(): Action {
        if (!(this.obj instanceof Mux))
            throw new Error("Attempted to set selection ports of a non-Mux object!");

        super.execute();
        this.obj.setSelectPortCount(this.targetCount);
        return this;
    }

    public undo(): Action {
        if (!(this.obj instanceof Mux))
            throw new Error("Attempted to set selection ports of a non-Mux object!");

        this.obj.setSelectPortCount(this.initialCount);
        super.undo();
        return this;
    }

}
