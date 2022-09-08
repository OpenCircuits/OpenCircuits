import {Action} from "core/actions/Action";

import {PortChangeAction} from "core/actions/bases/PortChangeAction";

import {Port} from "core/models";

import {Mux} from "digital/models/ioobjects/other/Mux";


class SelectPortChangeAction extends PortChangeAction<Mux> {
    protected override obj: Mux;

    /**
     * Sets the number of select ports on the object.
     *
     * @param obj    The object being changed.
     * @param target Number of ports.
     */
    public constructor(obj: Mux, target: number) {
        super(obj.getDesigner(), obj, target);

        this.execute();
    }

    /**
     * Gets selected ports from obj.
     *
     * @returns Selected ports from obj.
     */
    protected getPorts(): Port[] {
        return this.obj.getSelectPorts();
    }

    /**
     * This code executes the action by changing the size of the obj based on the target count
     * and then changes the number of input/output Ports based on whether the obj is a Mux or Demux.
     *
     * @returns The new obj with the new size and number of ports.
     */
    public override execute(): Action {
        super.execute();
        this.obj.setSelectPortCount(this.targetCount);
        return this;
    }

    /**
     * This code does the same as execute except it changes the size and number of ports back to the initial number.
     *
     * @returns The new object with the initial size and number of ports.
     */
    public override undo(): Action {
        this.obj.setSelectPortCount(this.initialCount);
        super.undo();
        return this;
    }

    public override getName(): string {
        return "Select Port Change";
    }

}

export function SetSelectPortCount(obj: Mux, target: number) {
    return new SelectPortChangeAction(obj, target);
}
