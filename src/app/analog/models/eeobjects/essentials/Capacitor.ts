import {serializable} from "serialeazy";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent, PropInfo} from "analog/models";
import {LeftRightPositioner} from "analog/models/ports/positioners/LeftRightPositioner";


@serializable("Capacitor")
export class Capacitor extends AnalogComponent {
    private static info: Record<string, PropInfo> = {
        "capacitance": {
            display: "Capacitance",
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
            V(20, 60), new LeftRightPositioner(),
            { "capacitance": 0.000001 }
        );
    }

    public override getNetlistSymbol() {
        return "C" as const;
    }

    public override getNetlistValues() {
        return [`${this.props["capacitance"]}`];
    }

    public getPropInfo(key: string): PropInfo {
        return Capacitor.info[key];
    }

    /**
     * Returns name of Component
     * @returns "Capacitor"
     */
    public getDisplayName(): string {
        return "Capacitor";
    }

    /**
     * Returns name of image file
     * @returns "capacitor.svg"
     */
    public getImageName(): string {
        return "capacitor.svg";
    }
}
