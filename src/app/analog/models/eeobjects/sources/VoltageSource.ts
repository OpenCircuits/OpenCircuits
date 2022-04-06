import {serializable} from "serialeazy";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent, PropInfo} from "analog/models";
import {TopBottomPositioner} from "analog/models/ports/positioners/TopBottomPositioner";
import {GenPropInfo, GroupPropInfo} from "analog/models/AnalogComponent";




const ConstInfo: GroupPropInfo = {
    type: "group",
    isActive: (state) => (state["waveform"] === "DC"),
    infos: {
        "voltage": {
            display: "Voltage",
            type: "float", min: 0,
        },
    },
};

const PulseInfo: GroupPropInfo = {
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
        "td": {
            display: "Delay Time",
            type: "float", min: 0,
        },
        "tr": {
            display: "Rise Time",
            type: "float", min: 0,
        },
        "tf": {
            display: "Fall Time",
            type: "float", min: 0,
        },
        "pw": {
            display: "Pulse Width",
            type: "float", min: 0,
        },
        "period": {
            display: "Period",
            type: "float", min: 0,
        },
        "phase": {
            display: "Phase",
            type: "float",
            min: 0, max: 360, step: 1,
        },
    },
};

const SineInfo: GroupPropInfo = {
    type: "group",
    isActive: (state) => (state["waveform"] === "SINE"),
    infos: {
        "v1": {
            display: "Offset Voltage",
            type: "float", min: 0,
        },
        "voltage": {
            display: "Amplitude Voltage",
            type: "float", min: 0,
        },
        "td": {
            display: "Delay Time",
            type: "float", min: 0,
        },
        "theta": {
            display: "Damping Factor",
            type: "float", min: 0,
        },
        "period": {
            display: "Period",
            type: "float", min: 0,
        },
        "phase": {
            display: "Phase",
            type: "float",
            min: 0, max: 360, step: 1,
        },
    },
};


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
                    ["Sine",   "SINE"],
                ],
            },
        },
        subgroups: [ ConstInfo, PulseInfo, SineInfo ],
    }]);

    public constructor() {
        super(
            new ClampedValue(2),
            V(50, 50), new TopBottomPositioner(),
            {
                "waveform": "DC", "voltage": 5,
                "v1": 0, "td": 0, "tr": 0.01, "tf": 0.01,
                "pw": 0.1, "period": 0.2,
                "phase": 0, "theta": 0,
            }
        );
    }

    public override getNetlistSymbol() {
        return "V" as const;
    }

    public override getNetlistValues() {
        return [

        ];
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
