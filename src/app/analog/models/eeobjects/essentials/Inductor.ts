import {serializable} from "serialeazy";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent, PropInfo} from "analog/models";
import {TopBottomPositioner} from "analog/models/ports/positioners/TopBottomPositioner";


@serializable("Inductor")
export class Inductor extends AnalogComponent {
    private static info: Record<string, PropInfo> = {
        "inductance": {
            display: "Inductance",
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
            V(40, 240*40/104), new TopBottomPositioner(),
            { "inductance": 0.000001 }
        );
    }

    public override getNetlistSymbol() {
        return "L" as const;
    }

    public override getNetlistValues() {
        return [`${this.props["inductance"]}`];
    }

    public getPropInfo(key: string): PropInfo {
        return Inductor.info[key];
    }

    /**
     * Returns name of Component
     * @returns "Inductor"
     */
    public getDisplayName(): string {
        return "Inductor";
    }

    /**
     * Returns name of image file
     * @returns "inductor.svg"
     */
    public getImageName(): string {
        return "inductor.svg";
    }
}
