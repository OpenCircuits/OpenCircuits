import {serializable} from "serialeazy";

import {V} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent} from "analog/models";

import {GenInitialInfo} from "analog/models/AnalogComponent";
import {InductanceInfo} from "analog/models/Units";

import {TopBottomPositioner} from "analog/models/ports/positioners/TopBottomPositioner";


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
     * Returns name of Component.
     *
     * @returns The string "Inductor".
     */
    public override getDisplayName(): string {
        return "Inductor";
    }

    /**
     * Returns name of image file.
     *
     * @returns The string "inductor.svg".
     */
    public override getImageName(): string {
        return "inductor.svg";
    }
}
