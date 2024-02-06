import {serializable} from "serialeazy";

import {V, Vector} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {DigitalComponent} from "digital/models/index";


/**
 * A representation of a Constant Low input.
 */
@serializable("ConstantLow")
export class ConstantLow extends DigitalComponent {

    /**
     * Creates a Constant Low input with 0 inputs, 1 output, and initial transform size of 50px by 50px.
     */
    public constructor() {
        super(new ClampedValue(0), new ClampedValue(1), V(1, 1));
        super.activate(false);
    }

    /**
     * Gets the offset (border width) of `this` Constant Low input.
     *
     * @returns The offset vector which represents a border width of 0px.
     */
    public override getOffset(): Vector {
        return V();
    }

    /**
     * Gets the display name of `this` Constant Low input.
     *
     * @returns The display name "Constant Low".
     */
    public getDisplayName(): string {
        return "Constant Low";
    }

    /**
     * Gets the image name of `this` Constant Low input.
     *
     * @returns The image name "constLow.svg".
     */
    public override getImageName(): string {
        return "constLow.svg";
    }
}
