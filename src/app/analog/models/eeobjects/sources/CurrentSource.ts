import {serializable} from "serialeazy";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent, PropInfo} from "analog/models";
import {TopBottomPositioner} from "analog/models/ports/positioners/TopBottomPositioner";


@serializable("CurrentSource")
export class CurrentSource extends AnalogComponent {
    private static info: Record<string, PropInfo> = {
        "current": {
            display: "Current",
            type: "float",
            min: 0,
        },
    }


    /**
     * Initializes Switch with no input ports, a single output port, and predetermined sizes
     */
    public constructor() {
        super(
            new ClampedValue(2),
            V(50, 50), new TopBottomPositioner(),
            { "current": 0.05 }
        );
    }

    public getPropInfo(key: string): PropInfo {
        return CurrentSource.info[key];
    }

    /**
     * Returns name of Component
     * @returns "Current Source"
     */
    public getDisplayName(): string {
        return "Current Source";
    }

    /**
     * Returns name of image file
     * @returns "currentsource.svg"
     */
    public getImageName(): string {
        return "currentsource.svg";
    }
}
