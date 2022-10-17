import {serializable} from "serialeazy";

import {V} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {GenPropInfo} from "core/utils/PropInfoUtils";

import {PropInfo} from "core/models/PropInfo";

import {AnalogComponent} from "analog/models/AnalogComponent";


const [Info, InitialProps] = GenPropInfo({
    infos: {
        "color": {
            type:    "color",
            label:   "Color",
            initial: "#ffffff",
        },
        "textColor": {
            type:    "color",
            label:   "Text Color",
            initial: "#000000",
        },
    },
});

@serializable("Label")
export class Label extends AnalogComponent {
    public constructor() {
        super(
            new ClampedValue(0),
            V(1.2, 0.6), undefined,
            InitialProps,
        );
    }

    public override getPropInfo(key: string): PropInfo {
        return Info[key] ?? super.getPropInfo(key);
    }

    public override getDisplayName(): string {
        return "LABEL";
    }
}
