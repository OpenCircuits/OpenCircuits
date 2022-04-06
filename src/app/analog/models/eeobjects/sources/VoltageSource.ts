import {serializable} from "serialeazy";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent, PropInfo} from "analog/models";
import {TopBottomPositioner} from "analog/models/ports/positioners/TopBottomPositioner";
import {NetlistElement} from "analog/models/sim/Netlist";


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

    public override getNetlistSymbol() {
        return "V" as const;
    }

    public override getNetlistValues() {
        return [`${this.props["voltage"]}`];
    }

    public override getPropInfo(key: string): PropInfo {
        return VoltageSource.info[key];
    }

    /**
     * Returns name of Component
     * @returns "Voltage Source"
     */
    public override getDisplayName(): string {
        return "Voltage Source";
    }

    /**
     * Returns name of image file
     * @returns "voltagesource.svg"
     */
    public override getImageName(): string {
        return "voltagesource.svg";
    }
}
