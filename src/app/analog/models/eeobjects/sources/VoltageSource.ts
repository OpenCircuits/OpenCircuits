import {serializable} from "serialeazy";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent, PropInfo} from "analog/models";
import {TopBottomPositioner} from "analog/models/ports/positioners/TopBottomPositioner";
import {GenPropInfo, GroupPropInfo} from "analog/models/AnalogComponent";




const ConstInfos: GroupPropInfo = {
    type: "group",
    isActive: (state) => (state["waveform"] === "DC"),
    infos: {
        "voltage": {
            display: "Voltage",
            type: "float", min: 0,
        },
    },
};

const PulseInfos: GroupPropInfo = {
    type: "group",
    isActive: (state) => (state["waveform"] === "PULSE"),
    infos: {
        "v1": {
            display: "Low Voltage",
            type: "float", min: 0,
        },
        "voltage": {
            display: "High Voltage",
            type: "float", min: 0,
        },
    },
}


@serializable("VoltageSource")
export class VoltageSource extends AnalogComponent {
    private static info = GenPropInfo([{
        type: "group",
        infos: {
            "waveform": { // Select
                display: "Waveform",
                type: "string[]",
                options: [
                    ["Const",  "DC"],
                    ["Square", "PULSE"],
                    // ["Sine",   "SINE"],
                ],
            },
        },
        subgroups: [
            ConstInfos,
            PulseInfos,
        ],
    }]);

    public constructor() {
        super(
            new ClampedValue(2),
            V(50, 50), new TopBottomPositioner(),
            { "waveform": "DC", "voltage": 5, "v1": 0 }
        );
    }

    public override getNetlistSymbol() {
        return "V" as const;
    }

    public override getNetlistValues() {
        return [`${this.props["voltage"]}`];
    }

    public override getPropInfo(key: string): PropInfo {
        return VoltageSource.info[key];
    }

    /**
     * Returns name of Component
     * @returns "Voltage Source"
     */
    public override getDisplayName(): string {
        return "Voltage Source";
    }

    /**
     * Returns name of image file
     * @returns "voltagesource.svg"
     */
    public override getImageName(): string {
        return "voltagesource.svg";
    }
}
