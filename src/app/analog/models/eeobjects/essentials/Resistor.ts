import {serializable} from "serialeazy";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent} from "analog/models";
import {LeftRightPositioner} from "analog/models/ports/positioners/LeftRightPositioner";
import {ResistanceInfo} from "analog/models/Units";
import {GenInitialInfo} from "analog/models/AnalogComponent";


const Info = {
    ...ResistanceInfo("R", "Resistance", 1, "k"),
};

@serializable("Resistor")
export class Resistor extends AnalogComponent {
    public constructor() {
        super(
            new ClampedValue(2),
            V(60, 50), new LeftRightPositioner(),
            GenInitialInfo(Info),
        );
    }

    public override getNetlistSymbol() {
        return "R" as const;
    }

    public override getNetlistValues() {
        return [`${this.props["R"]}`];
    }

    public override getPropInfo(key: string) {
        return Info[key];
    }

    /**
     * Returns name of Component
     * @returns "Resistor"
     */
    public override getDisplayName(): string {
        return "Resistor";
    }

    /**
     * Returns name of image file
     * @returns "resistor.svg"
     */
    public override getImageName(): string {
        return "resistor.svg";
    }
}
