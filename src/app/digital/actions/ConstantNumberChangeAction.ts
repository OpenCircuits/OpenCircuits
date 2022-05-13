import {Action} from "core/actions/Action";
import {ConstantNumber} from "digital/models/ioobjects";


/**
 * An action to change the input for a ConstantNumber
 */
export class ConstantNumberChangeAction implements Action {

    // The ConstantNumber component
    private constantNumber: ConstantNumber;

    // The input values
    private initialNum: number;
    private targetNum: number;

    /**
     * Create an action to change the input for a ConstantNumber
     *
     * @param constNum The `ConstantNumber` object
     * @param newInput The new input value (`0 <= newInput < 16`)
     */
    public constructor(constNum: ConstantNumber, newInput: number) {
        this.constantNumber = constNum;
        this.initialNum = constNum.getInputNum();
        this.targetNum = newInput;
    }

    /**
     * Sets the input value of the ConstantNumber to the new Input value
     *
     * @returns the action
     */
    public execute(): Action {
        this.constantNumber.setInput(this.targetNum);
        return this;
    }

    /**
     * Sets the input value of the ConstantNumber to the initial Input value
     *
     * @returns the action
     */
    public undo(): Action {
        this.constantNumber.setInput(this.initialNum);
        return this;
    }

    /**
     * Gets the name of the action
     *
     * @returns "Constant Number Change"
     */
    public getName(): string {
        return "Constant Number Change"
    }
}
