import {Action} from "core/actions/Action";
import {ConstantNumber} from "digital/models/ioobjects";


/**
 * An action to change the input for a ConstantNumber
 */
export class ConstantNumberChangeAction implements Action {

    // the ConstantNumber component
    private constantNumber: ConstantNumber;

    // the input values
    private initialNum: number;
    private targetNum: number;

    /**
     * Create an action to change the input for a ConstantNumber
     * @param constNum The `ConstantNumber` object
     * @param newInput The new input value (`0 <= newInput < 16`)
     */
    public constructor(constNum: ConstantNumber, newInput: number) {
        this.constantNumber = constNum;
        this.initialNum = constNum.getInputNum();
        this.targetNum = newInput;
    }

    public execute(): Action {
        this.constantNumber.setInput(this.targetNum);
        return this;
    }

    public undo(): Action {
        this.constantNumber.setInput(this.initialNum);
        return this;
    }

    public getName(): string {
        return "Constant Number Change"
    }
}
