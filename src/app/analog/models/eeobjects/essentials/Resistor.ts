import {serializable} from "serialeazy";

import {V} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {GenPropInfo} from "core/utils/PropInfoUtils";

import {AnalogComponent} from "analog/models";

import {ResistanceInfo} from "analog/models/Units";

import {LeftRightPositioner} from "analog/models/ports/positioners/LeftRightPositioner";


const [Info, InitialProps] = GenPropInfo({
    infos: {
        ...ResistanceInfo("R", "Resistance", 1, "k"),
    },
});

@serializable("Resistor")
export class Resistor extends AnalogComponent {
    public constructor() {
        super(
            new ClampedValue(2),
            V(1.2, 1), new LeftRightPositioner(),
            InitialProps,
        );
    }

    public override getNetlistSymbol() {
        return "R" as const;
    }

    public override getNetlistValues() {
        return [`${this.props["R"]}`];
    }

    public override getPropInfo(key: string) {
        return Info[key] ?? super.getPropInfo(key);
    }

    /**
     * Returns name of Component.
     *
     * @returns The string "Resistor".
     */
    public override getDisplayName(): string {
        return "Resistor";
    }

    /**
     * Returns name of image file.
     *
     * @returns The string "resistor.svg".
     */
    public override getImageName(): string {
        return "resistor.svg";
    }
}
