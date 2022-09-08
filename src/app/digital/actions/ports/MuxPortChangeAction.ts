
import {Action} from "core/actions/Action";

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
 */
export class MuxPortChangeAction extends PortChangeAction {
    protected obj: Mux;

    protected otherPortAction: PortChangeAction;

    /**
     * Either changes the size of the inputs if it's a multiplexor or the outputs if it's a Demux.
     *
     * @param obj     Refers to the Mux object.
     * @param initial Refers to the initial number of inputs.
     * @param target  Refers to the new number of inputs requested.
     */
    public constructor(obj: Mux, initial: number, target: number) {
        super(obj.getDesigner(), target, initial);
        this.obj = obj;

        this.otherPortAction = obj instanceof Multiplexer
                               ? new InputPortChangeAction(obj, Math.pow(2, initial), Math.pow(2, target))
                               : new OutputPortChangeAction(obj, Math.pow(2, initial), Math.pow(2, target));
    }

    /**
     * This function changes the width and height of the obj based on the number of ports chosen.
     *
     * @param val The target number the user chose.
     */
    protected changeSize(val: number): void {
        this.obj.setSize(Mux.CalcSize(val));
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
        // Change size first
        this.changeSize(this.targetCount);

        super.execute();
        this.otherPortAction.execute();
        this.obj.setSelectPortCount(this.targetCount);
        return this;
    }

    /**
     * This code does the same as execute except it changes the size and number of ports back to the initial number.
     *
     * @returns The new object with the initial size and number of ports.
     */
    public override undo(): Action {
        // Change size back first
        this.changeSize(this.initialCount);

        this.obj.setSelectPortCount(this.initialCount);
        this.otherPortAction.undo();
        super.undo();
        return this;
    }

    public override getName(): string {
        return "Mux Port Change";
    }

}
