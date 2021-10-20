import { DigitalComponent } from "digital/models/DigitalComponent";
import { ClampedValue } from "math/ClampedValue";
import { DecimalToBCD } from "math/MathUtils";
import { serializable, serialize } from "serialeazy";
import { V } from "Vector";

/**
 * A constant number input. This allows the user to control a 4 bit constant
 * output by using a single hexadecimal digit as input.
 */
@serializable("ConstantNumber")
export class ConstantNumber extends DigitalComponent {

    // The number used to determine the output values
    @serialize
    private inputNumber : number;

    /**
     * Constructs a constant number input object.
     */
    public constructor() {
        super(new ClampedValue(0), new ClampedValue(4), V(50,50));
        this.setInput(0);
    }

    /**
     * Gets the display name for a Constant Number object
     * @returns The display name "Constant Number"
     */
    public getDisplayName(): string {
        return "Constant Number";
    }

    /**
     * Set the value of the input number.
     * @param input The new input value
     * @requires `0 <= input < 16`
     */
    public setInput(input: number): void {
        if (!Number.isInteger(input) || input < 0 || input >= 16) {
            throw "input must be an integer in [0,16)"
        }
        this.inputNumber = input;
        // set outputs for the new input value
        let outputs = DecimalToBCD(input) // length <= 4 since input < 16
        while (outputs.length < 4) { // ensure length is 4
            outputs.push(false);
        }
        outputs.forEach((value,i) => super.activate(value,i));
    }

    /**
     * Get the value of the input number.
     * @returns The input value
     */
    public getInput(): number {
        return this.inputNumber;
    }

    /**
     * Get the name of the image file used.
     * @returns The name of the image file
     */
    public getImageName(): string {
        return "constNumber.svg";
    }
}
