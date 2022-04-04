import {serializable} from "serialeazy";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent, PropInfo} from "analog/models/AnalogComponent";


@serializable("Label")
export class Label extends AnalogComponent {
    private static info: Record<string, PropInfo> = {
        "color": {
            display: "Color",
            type: "color",
        },
        "textColor": {
            display: "Text Color",
            type: "color",
        },
    }

    public constructor() {
        super(
            new ClampedValue(0),
            V(60, 30), undefined,
            {
                "color":  "#ffffff",
                "textColor": "#000000",
            }
        );
    }

    public getPropInfo(key: string): PropInfo {
        return Label.info[key];
    }

    public getDisplayName(): string {
        return "LABEL";
    }
}
