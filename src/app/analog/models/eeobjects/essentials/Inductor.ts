import {serializable} from "serialeazy";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent} from "analog/models";
import {TopBottomPositioner} from "analog/models/ports/positioners/TopBottomPositioner";
import {InductanceInfo} from "analog/models/Units";
import {GenInitialInfo} from "analog/models/AnalogComponent";


const Info = {
    ...InductanceInfo("L", "Inductance", 10, "m"),
};

@serializable("Inductor")
export class Inductor extends AnalogComponent {
    public constructor() {
        super(
            new ClampedValue(2),
            V(40, 240*40/104), new TopBottomPositioner(),
            GenInitialInfo(Info),
        );
    }

    public override getNetlistSymbol() {
        return "L" as const;
    }

    public override getNetlistValues() {
        return [`${this.props["L"]}`];
    }

    public override getPropInfo(key: string) {
        return Info[key];
    }

    /**
     * Returns name of Component
     * @returns "Inductor"
     */
    public override getDisplayName(): string {
        return "Inductor";
    }

    /**
     * Returns name of image file
     * @returns "inductor.svg"
     */
    public override getImageName(): string {
        return "inductor.svg";
    }
}
