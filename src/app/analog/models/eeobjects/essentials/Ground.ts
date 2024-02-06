import {serializable} from "serialeazy";

import {V} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent} from "analog/models";

import {SidePositioner} from "analog/models/ports/positioners/SidePositioner";


@serializable("Ground")
export class Ground extends AnalogComponent {

    /**
     * Initializes ground.
     */
    public constructor() {
        super(
            new ClampedValue(1),
            V(1.2, 0.6), new SidePositioner("top")
        );
    }

    /**
     * Returns name of Component.
     *
     * @returns The string "Ground".
     */
    public getDisplayName(): string {
        return "Ground";
    }

    /**
     * Returns name of image file.
     *
     * @returns The string "ground.svg".
     */
    public override getImageName(): string {
        return "ground.svg";
    }
}
