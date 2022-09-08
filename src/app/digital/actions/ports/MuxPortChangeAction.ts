import {Action}      from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";

import {PortChangeAction} from "core/actions/ports/PortChangeAction";

import {Port} from "core/models";

import {Multiplexer} from "digital/models/ioobjects/other/Multiplexer";
import {Mux}         from "digital/models/ioobjects/other/Mux";

import {InputPortChangeAction}  from "./InputPortChangeAction";
import {OutputPortChangeAction} from "./OutputPortChangeAction";


/**
 * This code changes the size of the Mux object based on how many inputs are entered.
 * When the selector inputs are increased the number of inputs are also increased by
 * 2 to the power of the number of selector inputs chosen.
 * Ex.) input count = 3, then the number of inputs changes to 2^3 or 8.
 * The actual size of the mux object is also changed accordingly.
 *
 * @param obj    Refers to the Mux object.
 * @param target Refers to the new number of inputs requested.
 * @returns        A port change action for mux's.
 */
export function CreateMuxPortChangeAction(obj: Mux, target: number) {
    return new GroupAction([
        new SelectPortChangeAction(obj, target),
        (obj instanceof Multiplexer
            ?  new InputPortChangeAction(obj, Math.pow(2, target))
            : new OutputPortChangeAction(obj, Math.pow(2, target))),
    ]);
}

export class SelectPortChangeAction extends PortChangeAction<Mux> {
    protected obj: Mux;

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
    public execute(): Action {
        super.execute();
        this.obj.setSelectPortCount(this.targetCount);
        return this;
    }

    /**
     * This code does the same as execute except it changes the size and number of ports back to the initial number.
     *
     * @returns The new object with the initial size and number of ports.
     */
    public undo(): Action {
        this.obj.setSelectPortCount(this.initialCount);
        super.undo();
        return this;
    }

    public getName(): string {
        return "Select Port Change";
    }

}
