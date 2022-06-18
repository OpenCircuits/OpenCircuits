import {serializable} from "serialeazy";

import {V} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent} from "analog/models";

import {GenInitialInfo} from "analog/models/AnalogComponent";
import {AmperageInfo}   from "analog/models/Units";

import {TopBottomPositioner} from "analog/models/ports/positioners/TopBottomPositioner";


const Info = {
    ...AmperageInfo("c", "Current", 0.05),
};

@serializable("CurrentSource")
export class CurrentSource extends AnalogComponent {
    public constructor() {
        super(
            new ClampedValue(2),
            V(50, 50), new TopBottomPositioner(),
            GenInitialInfo(Info),
        );
    }

    public override getNetlistSymbol() {
        return "I" as const;
    }

    public override getNetlistValues() {
        return [`${this.props["c"]}`];
    }

    public override getPropInfo(key: string) {
        return Info[key];
    }

    /**
     * Returns name of Component
     *
     * @returns "Current Source"
     */
    public override getDisplayName(): string {
        return "Current Source";
    }

    /**
     * Returns name of image file
     *
     * @returns "currentsource.svg"
     */
    public override getImageName(): string {
        return "currentsource.svg";
    }
}
