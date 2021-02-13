import {DEFAULT_SIZE} from "core/utils/Constants";

import {V} from "Vector";

import {Action} from "core/actions/Action";

import {Encoder} from "digital/models/ioobjects/other/Encoder";
import {Decoder} from "digital/models/ioobjects/other/Decoder";

import {InputPortChangeAction} from "./InputPortChangeAction";
import {OutputPortChangeAction} from "./OutputPortChangeAction";

export class CoderPortChangeAction implements Action {
    protected obj: Encoder | Decoder;

    protected initialCount: number;
    protected targetCount: number;

    protected inputPortAction: InputPortChangeAction;
    protected outputPortAction: OutputPortChangeAction;

    public constructor(obj: Encoder | Decoder, initial: number, target: number) {
        this.obj = obj;
        this.targetCount = target;

        if (obj instanceof Encoder) {
            this.initialCount = obj.getOutputPortCount().getValue();
            this.inputPortAction  = new InputPortChangeAction(obj, initial, Math.pow(2, target));
            this.outputPortAction = new OutputPortChangeAction(obj, initial, target);
        } else {
            this.initialCount = obj.getInputPortCount().getValue();
            this.inputPortAction  = new InputPortChangeAction(obj, initial, target);
            this.outputPortAction = new OutputPortChangeAction(obj, initial, Math.pow(2, target));
        }
    }

    protected changeSize(val: number): void {
        this.obj.setSize(V(DEFAULT_SIZE, DEFAULT_SIZE/2 * Math.pow(2, val)));
    }

    public execute(): Action {
        // Change size first
        this.changeSize(this.targetCount);

        this.inputPortAction.execute();
        this.outputPortAction.execute();
        return this;
    }

    public undo(): Action {
        // Change size back first
        this.changeSize(this.initialCount);

        this.outputPortAction.undo();
        this.inputPortAction.undo();
        return this;
    }

}
