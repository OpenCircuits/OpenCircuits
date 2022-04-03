import {Port} from "core/models";

import {Action} from "core/actions/Action";
import {PortChangeAction} from "core/actions/ports/PortChangeAction";

import {Mux} from "digital/models/ioobjects/other/Mux";
import {Multiplexer} from "digital/models/ioobjects/other/Multiplexer";

import {InputPortChangeAction} from "./InputPortChangeAction";
import {OutputPortChangeAction} from "./OutputPortChangeAction";


/**
 * This code changes the size of the Mux object based on how many inputs are entered.
 * When the selector inputs are increased the number of inputs are also increased by 2 to the power of the number of selector inputs chosen.
 * Ex.) input count = 3, then the number of inputs changes to 2^3 or 8.
 * The actual size of the mux object is also changed accordingly.
 */
export class MuxPortChangeAction extends PortChangeAction {
    protected obj: Mux;

    protected otherPortAction: PortChangeAction;

    /**
     * Either changes the size of the inputs if it's a multiplexor or the outputs if it's a Demux.
     *
     * @param obj refers to the Mux object
     * @param initial refers to the initial number of inputs
     * @param target refers to the new number of inputs requested
     */
    public constructor(obj: Mux, initial: number, target: number) {
        super(obj.getDesigner(), target, initial);
        this.obj = obj;

        if (obj instanceof Multiplexer)
            this.otherPortAction = new InputPortChangeAction(obj, Math.pow(2, initial), Math.pow(2, target));
        else
            this.otherPortAction = new OutputPortChangeAction(obj, Math.pow(2, initial), Math.pow(2, target));
    }

    /**
     * This function changes the width and height of the obj based on the number of ports chosen.
     *
     * @param val is the target number the user chose.
     */
    protected changeSize(val: number): void {
        this.obj.setSize(Mux.calcSize(val));
    }

    /**
     * Gets selected ports from obj
     *
     * @returns selected ports from obj
     */
    protected getPorts(): Port[] {
        return this.obj.getSelectPorts();
    }

    /**
     * This code executes the action by changing the size of the obj based on the target count
     * and then changes the number of input/output Ports based on whether the obj is a Mux or Demux.
     *
     * @returns the new obj with the new size and number of ports.
     */
    public execute(): Action {
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
     * @returns the new object with the initial size and number of ports.
     */
    public undo(): Action {
        // Change size back first
        this.changeSize(this.initialCount);

        this.obj.setSelectPortCount(this.initialCount);
        this.otherPortAction.undo();
        super.undo();
        return this;
    }

    public getName(): string {
        return "Mux Port Change";
    }

}
