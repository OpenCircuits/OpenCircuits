import {serializable} from "serialeazy";

import {V} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {GenPropInfo} from "core/utils/PropInfoUtils";

import {AnalogComponent} from "analog/models";

import {InductanceInfo} from "analog/models/Units";

import {TopBottomPositioner} from "analog/models/ports/positioners/TopBottomPositioner";


const [Info, InitialProps] = GenPropInfo({
    infos: {
        ...InductanceInfo("L", "Inductance", 10, "m"),
    },
});

@serializable("Inductor")
export class Inductor extends AnalogComponent {
    public constructor() {
        super(
            new ClampedValue(2),
            V(0.8, 240*0.8/104), new TopBottomPositioner(),
            InitialProps,
        );
    }

    public override getNetlistSymbol() {
        return "L" as const;
    }

    public override getNetlistValues() {
        return [`${this.props["L"]}`];
    }

    public override getPropInfo(key: string) {
        return Info[key] ?? super.getPropInfo(key);
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
