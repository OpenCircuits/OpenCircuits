import {serializable, serialize} from "serialeazy";
import {V} from "Vector";
import {DecimalToBCD} from "math/MathUtils";
import {ClampedValue} from "math/ClampedValue";
import {DigitalComponent} from "digital/models/DigitalComponent";


/**
 * A constant number input. This allows the user to control a 4 bit constant
 * output by using a single hexadecimal digit as input.
 */
@serializable("ConstantNumber")
export class ConstantNumber extends DigitalComponent {

    // The number used to determine the output values
    @serialize
    private inputNum: number;

    /**
     * Constructs a constant number input object.
     */
    public constructor() {
        super(new ClampedValue(0), new ClampedValue(4), V(50,50));
        this.setInput(0);
    }

    /**
     * Set the value of the input number.
     * @param input The new input value
     * @requires `0 <= input < 16`
     */
    public setInput(input: number): void {
        if (!Number.isInteger(input) || input < 0 || input >= 16)
            throw "input must be an integer in [0,16)"
        this.inputNum = input;
        // set outputs for the new input value
        const outputs = DecimalToBCD(input);
        this.getOutputPorts().forEach((_, i) =>
            super.activate((i < outputs.length && outputs[i]), i)
        );
    }

    /**
     * Get the value of the input number.
     * @returns The input value
     */
    public getInputNum(): number {
        return this.inputNum;
    }

    /**
     * Gets the display name for a Constant Number object
     * @returns The display name "Constant Number"
     */
     public getDisplayName(): string {
        return "Constant Number";
    }
}
