import {serializable} from "serialeazy";

import {V} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {GenPropInfo} from "core/utils/PropInfoUtils";

import {AnalogComponent} from "analog/models";

import {AmperageInfo} from "analog/models/Units";

import {TopBottomPositioner} from "analog/models/ports/positioners/TopBottomPositioner";


const [Info, InitialProps] = GenPropInfo({
    infos: {
        ...AmperageInfo("c", "Current", 0.05),
    },
});

@serializable("CurrentSource")
export class CurrentSource extends AnalogComponent {
    public constructor() {
        super(
            new ClampedValue(2),
            V(1, 1), new TopBottomPositioner(),
            InitialProps,
        );
    }

    public override getNetlistSymbol() {
        return "I" as const;
    }

    public override getNetlistValues() {
        return [`${this.props["c"]}`];
    }

    public override getPropInfo(key: string) {
        return Info[key] ?? super.getPropInfo(key);
    }

    /**
     * Returns name of Component.
     *
     * @returns The string "Current Source".
     */
    public override getDisplayName(): string {
        return "Current Source";
    }

    /**
     * Returns name of image file.
     *
     * @returns The string "currentsource.svg".
     */
    public override getImageName(): string {
        return "currentsource.svg";
    }
}
