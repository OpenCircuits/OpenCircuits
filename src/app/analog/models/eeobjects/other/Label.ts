import {serializable} from "serialeazy";

import {V} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {GenInitialInfo} from "core/utils/PropInfoUtils";

import {PropInfo} from "core/models/PropInfo";

import {AnalogComponent} from "analog/models/AnalogComponent";


const Info: Record<string, PropInfo> = {
    "color": {
        type:    "color",
        display: "Color",
        initial: "#ffffff",
    },
    "textColor": {
        type:    "color",
        display: "Text Color",
        initial: "#000000",
    },
};

@serializable("Label")
export class Label extends AnalogComponent {
    public constructor() {
        super(
            new ClampedValue(0),
            V(60, 30), undefined,
            GenInitialInfo(Info),
        );
    }

    public override getPropInfo(key: string): PropInfo {
        return Info[key];
    }

    public override getDisplayName(): string {
        return "LABEL";
    }
}
