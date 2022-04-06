import {serializable} from "serialeazy";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent} from "analog/models";
import {TopPositioner} from "analog/models/ports/positioners/TopPositioner";


@serializable("Ground")
export class Ground extends AnalogComponent {

    /**
     * Initializes ground
     */
    public constructor() {
        super(
            new ClampedValue(1),
            V(60, 30), new TopPositioner()
        );
    }

    /**
     * Returns name of Component
     * @returns "Ground"
     */
    public getDisplayName(): string {
        return "Ground";
    }

    /**
     * Returns name of image file
     * @returns "ground.svg"
     */
    public getImageName(): string {
        return "ground.svg";
    }
}
