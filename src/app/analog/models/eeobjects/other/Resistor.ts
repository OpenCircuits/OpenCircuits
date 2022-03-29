import {serializable} from "serialeazy";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent} from "analog/models";
import {LeftRightPositioner} from "analog/models/ports/positioners/LeftRightPositioner";


@serializable("Resistor")
export class Resistor extends AnalogComponent {

    /**
     * Initializes Switch with no input ports, a single output port, and predetermined sizes
     */
    public constructor() {
        super(new ClampedValue(2),
              V(60, 50), new LeftRightPositioner());
    }

    /**
     * Returns name of Component
     * @returns "Resistor"
     */
    public getDisplayName(): string {
        return "Resistor";
    }

    /**
     * Returns name of image file
     * @returns "resistor.svg"
     */
    public getImageName(): string {
        return "resistor.svg";
    }
}
