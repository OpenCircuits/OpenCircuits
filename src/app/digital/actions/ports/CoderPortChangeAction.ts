import {DEFAULT_SIZE} from "core/utils/Constants";

import {V} from "Vector";

import {Action} from "core/actions/Action";

import {Encoder} from "digital/models/ioobjects/other/Encoder";
import {Decoder} from "digital/models/ioobjects/other/Decoder";

import {InputPortChangeAction} from "./InputPortChangeAction";
import {OutputPortChangeAction} from "./OutputPortChangeAction";


/**
 * This code changes the size of the Encoder/Decoder object based on how many inputs/ouputs are entered.
 * The number of inputs (decoder) or outputs (encoder) are increased by 2 to the power of the number of inputs/outputs chosen.
 * Ex.) output count chosen  = 3, then the number of inputs changes to 2^3 or 8 for an encoder.
 * The actual size of the object is also changed accordingly.
 */
export class CoderPortChangeAction implements Action {
    protected obj: Encoder | Decoder;

    protected initialCount: number;
    protected targetCount: number;

    protected inputPortAction: InputPortChangeAction;
    protected outputPortAction: OutputPortChangeAction;

    /**
     * The constrcutor determines whether the object is an encoder or decoder and calls on the corresponding actions based on the type.
     *
     * @param obj is the encoder or decoder selected
     * @param initial the inital number of outputs/inputs
     * @param target the target numbe of outputs/inputs
     */
    public constructor(obj: Encoder | Decoder, initial: number, target: number) {
        this.obj = obj;
        this.targetCount = target;
        if (obj instanceof Encoder) {
            this.initialCount = obj.getOutputPortCount().getValue();
            this.inputPortAction  = new InputPortChangeAction(obj, obj.getInputPortCount().getValue(), Math.pow(2, target));
            this.outputPortAction = new OutputPortChangeAction(obj, initial, target);
        } else {
            this.initialCount = obj.getInputPortCount().getValue();
            this.inputPortAction  = new InputPortChangeAction(obj, initial, target);
            this.outputPortAction = new OutputPortChangeAction(obj, obj.getOutputPortCount().getValue(), Math.pow(2, target));
        }
    }
    
    /**
     * This code changes the size of the actual object.
     *
     * @param val refers to the target number chosen by the user.
     */
    protected changeSize(val: number): void {
        this.obj.setSize(V(DEFAULT_SIZE, DEFAULT_SIZE/2 * Math.pow(2, val)));
    }
    
    /**
     * This function calls upon the change size function and the port actions to change the size of the obj and the number of inputs/output ports.
     *
     * @returns the changed object
     */
    public execute(): Action {
        // Change size first
        this.changeSize(this.targetCount);

        this.inputPortAction.execute();
        this.outputPortAction.execute();
        return this;
    }
    
    /**
     * This function undoes the execute(): Action function and sets the size and number of ports back to the inital count and size.
     *
     * @returns the initial object
     */
    public undo(): Action {
        // Change size back first
        this.changeSize(this.initialCount);

        this.outputPortAction.undo();
        this.inputPortAction.undo();
        return this;
    }

    public getName(): string {
        return "Coder Port Change";
    }

}
