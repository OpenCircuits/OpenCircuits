import {serializable} from "serialeazy";

import {V} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent} from "analog/models";

import {GenInitialInfo, GenPropInfo, GroupPropInfo}      from "analog/models/AnalogComponent";
import {AngleInfo, FrequencyInfo, TimeInfo, VoltageInfo} from "analog/models/Units";

import {TopBottomPositioner} from "analog/models/ports/positioners/TopBottomPositioner";


const ConstInfo: GroupPropInfo = {
    type:     "group",
    isActive: (state) => (state["waveform"] === "DC"),
    infos:    {
        ...VoltageInfo("V", "Voltage", 5),
    },
};

const PulseInfo: GroupPropInfo = {
    type:     "group",
    isActive: (state) => (state["waveform"] === "DC PULSE"),
    infos:    {
        ...VoltageInfo("v1", "Low Voltage",  0),
        ...VoltageInfo( "V", "High Voltage", 5),
           ...TimeInfo("td", "Delay Time",   0),
           ...TimeInfo("tr", "Rise Time",    0.01),
           ...TimeInfo("tf", "Fall Time",    0.01),
           ...TimeInfo("pw", "Pulse Width",  0.1),
           ...TimeInfo( "p", "Period",       0.2),
          ...AngleInfo("ph", "Phase",        0),
    },
};

const SineInfo: GroupPropInfo = {
    type:     "group",
    isActive: (state) => (state["waveform"] === "DC SINE"),
    infos:    {
        ...VoltageInfo("v1", "Offset Voltage", 0),
        ...VoltageInfo("V", "Amplitude Voltage", 5),
        // TODO: Add dependent variables
        //  so we can `period` and `frequency` which are inverses and update
        //  each-other as they update
        ...FrequencyInfo("f", "Frequency", 5),
        ...TimeInfo("td", "Delay Time", 0),
         "d": { display: "Damping Factor", initial: 0, type: "float", min: 0 },
        ...AngleInfo("ph", "Phase", 0),
    },
};

const Info = GenPropInfo([{
    type:  "group",
    infos: {
        "waveform": { // Select
            display: "Waveform",
            type:    "string[]",
            initial: "DC",
            options: [
                ["Const",  "DC"],
                ["Square", "DC PULSE"],
                ["Sine",   "DC SINE"],
            ],
        },
    },
    subgroups: [ ConstInfo, PulseInfo, SineInfo ],
}]);

@serializable("VoltageSource")
export class VoltageSource extends AnalogComponent {
    public constructor() {
        super(
            new ClampedValue(2),
            V(50, 50), new TopBottomPositioner(),
            GenInitialInfo(Info),
        );
    }

    public override getNetlistSymbol() {
        return "V" as const;
    }

    public override getNetlistValues() {
        const InfoMap = {
            "DC":       ConstInfo,
            "DC PULSE": PulseInfo,
            "DC SINE":  SineInfo,
        };

        const type = this.props["waveform"] as "DC"|"DC PULSE"|"DC SINE";

        // Filter out unit keys
        const keys = Object.keys(InfoMap[type].infos).filter(key => !key.endsWith("_U"));

        return [`${type}(${keys.map(k => this.props[k]!).join(" ")})`];
    }

    public override getPropInfo(key: string) {
        return Info[key];
    }

    /**
     * Returns name of Component.
     *
     * @returns The string "Voltage Source".
     */
    public override getDisplayName(): string {
        return "Voltage Source";
    }

    /**
     * Returns name of image file.
     *
     * @returns The string "voltagesource.svg".
     */
    public override getImageName(): string {
        return "voltagesource.svg";
    }
}
