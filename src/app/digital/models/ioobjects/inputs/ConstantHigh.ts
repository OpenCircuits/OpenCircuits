import {V, Vector} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {DigitalComponent} from "digital/models/DigitalComponent";
import {serializable} from "serialeazy";

/**
 * Creates a constant high circuit component.
 */

@serializable("ConstantHigh")
export class ConstantHigh extends DigitalComponent {

    /**
     * Constructs a constant high with 0 inputs, 1 output, and 2D display size 50x50.
     * Constant highs are active, so sets active to true.
     */
    public constructor() {
        super(new ClampedValue(0), new ClampedValue(1), V(50, 50));
        super.activate(true);
    }
    /**
     * Get size of offset needed.
     * @returns An empty vector.
     */
    // @Override
    public getOffset(): Vector {
        return V();
    }

    /**
     * Gets the display name of constant high.
     * @returns The display name of constant high.
     */
    public getDisplayName(): string {
        return "Constant High";
    }

    /**
     * Gets the name of the constant high image file.
     * @returns The name of the image file.
     */
    public getImageName(): string {
        return "constHigh.svg";
    }

}
