import {serializable} from "serialeazy";

import {V} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {GenPropInfo, PropInfoLayout}        from "core/utils/PropInfoUtils";
import {AngleInfo, FrequencyInfo, TimeInfo} from "core/utils/Units";

import {AnalogComponent} from "analog/models";

import {VoltageInfo} from "analog/models/Units";

import {TopBottomPositioner} from "analog/models/ports/positioners/TopBottomPositioner";


const ConstInfo: PropInfoLayout = {
    isActive: (states) => (states.every((state) => state["waveform"] === "DC")),

    infos: {
        ...VoltageInfo("V", "Voltage", 5),
    },
};

const PulseInfo: PropInfoLayout = {
    isActive: (states) => (states.every((state) => state["waveform"] === "DC PULSE")),

    /* eslint-disable space-in-parens */
    infos: {
        ...VoltageInfo("v1", "Low Voltage",  0),
        ...VoltageInfo( "V", "High Voltage", 5),
           ...TimeInfo("td", "Delay Time",   0),
           ...TimeInfo("tr", "Rise Time",    0.01),
           ...TimeInfo("tf", "Fall Time",    0.01),
           ...TimeInfo("pw", "Pulse Width",  0.1),
           ...TimeInfo( "p", "Period",       0.2),
          ...AngleInfo("ph", "Phase",        0),
    },
    /* eslint-enable space-in-parens */
};

const SineInfo: PropInfoLayout = {
    isActive: (states) => (states.every((state) => state["waveform"] === "DC SINE")),

    infos: {
        ...VoltageInfo("v1", "Offset Voltage", 0),
        ...VoltageInfo("V", "Amplitude Voltage", 5),
        // TODO: Add dependent variables
        //  so we can `period` and `frequency` which are inverses and update
        //  each-other as they update
        ...FrequencyInfo("f", "Frequency", 5),
        ...TimeInfo("td", "Delay Time", 0),
         "d": { label: "Damping Factor", initial: 0, type: "float", min: 0 },
        ...AngleInfo("ph", "Phase", 0),
    },
};

const [Info, InitialProps] = GenPropInfo({
    infos: {
        "waveform": { // Select
            label:   "Waveform",
            type:    "string[]",
            initial: "DC",
            options: [
                ["Const",  "DC"],
                ["Square", "DC PULSE"],
                ["Sine",   "DC SINE"],
            ],
        },
    },
    sublayouts: [ ConstInfo, PulseInfo, SineInfo ],
});

@serializable("VoltageSource")
export class VoltageSource extends AnalogComponent {
    public constructor() {
        super(
            new ClampedValue(2),
            V(1, 1), new TopBottomPositioner(),
            InitialProps,
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
        const keys = Object.keys(InfoMap[type].infos).filter((key) => !key.endsWith("_U"));

        return [`${type}(${keys.map((k) => this.props[k]!).join(" ")})`];
    }

    public override getPropInfo(key: string) {
        return Info[key] ?? super.getPropInfo(key);
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
