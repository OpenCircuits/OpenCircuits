import {serializable} from "serialeazy";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent, PropInfo} from "analog/models";
import {TopBottomPositioner} from "analog/models/ports/positioners/TopBottomPositioner";


@serializable("VoltageSource")
export class VoltageSource extends AnalogComponent {
    private static info: Record<string, PropInfo> = {
        "voltage": {
            display: "Voltage",
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
            { "voltage": 5 }
        );
    }

    public getPropInfo(key: string): PropInfo {
        return VoltageSource.info[key];
    }

    /**
     * Returns name of Component
     * @returns "Voltage Source"
     */
    public getDisplayName(): string {
        return "Voltage Source";
    }

    /**
     * Returns name of image file
     * @returns "voltagesource.svg"
     */
    public getImageName(): string {
        return "voltagesource.svg";
    }
}
