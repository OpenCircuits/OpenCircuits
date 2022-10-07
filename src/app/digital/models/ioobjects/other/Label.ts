import {serializable} from "serialeazy";

import {V} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {GenPropInfo} from "core/utils/PropInfoUtils";

import {DigitalComponent} from "digital/models/DigitalComponent";


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
export class Label extends DigitalComponent {
    public constructor() {
        super(
            new ClampedValue(0),
            new ClampedValue(0),
            V(1.2, 0.6), undefined, undefined,
            InitialProps,
        );
    }

    public override getPropInfo(key: string) {
        return Info[key] ?? super.getPropInfo(key);
    }

    public override getDisplayName(): string {
        return "LABEL";
    }
}
