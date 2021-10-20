import { Action } from "core/actions/Action";
import { ConstantNumber } from "digital/models/ioobjects";

/**
 * An action to change the input for a ConstantNumber
 */
export class ConstantNumberChangeAction implements Action {

    // the ConstantNumber component
    private constantNumber: ConstantNumber;

    // the input values
    private inputNumber: number;
    private inputNumberPrev: number;

    /**
     * Create an action to change the input for a ConstantNumber
     * @param constNum The `ConstantNumber` object
     * @param newInput The new input value (`0 <= newInput < 16`)
     */
    public constructor(constNum: ConstantNumber, newInput: number) {
        this.constantNumber = constNum;
        this.inputNumberPrev = constNum.getInput();
        this.inputNumber = newInput;
    }

    public execute(): Action {
        this.constantNumber.setInput(this.inputNumber);
        return this;
    }

    public undo(): Action {
        this.constantNumber.setInput(this.inputNumberPrev);
        return this;
    }
}
