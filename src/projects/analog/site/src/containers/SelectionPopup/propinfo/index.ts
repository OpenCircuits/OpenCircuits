import {MakeDefaultPropInfoGetter, PropInfoEntry} from "shared/site/containers/SelectionPopup/propinfo/PropInfo";
import {AngleInfo, DEFAULT_COMPONENT_PROP_INFO,
        DEFAULT_PORT_PROP_INFO,
        DEFAULT_WIRE_PROP_INFO,
        FrequencyInfo,
        MakeUnitInfo,
        TimeInfo} from "shared/site/containers/SelectionPopup/propinfo/DefaultPropInfo";


const VoltageInfo = (key: string, label: string, initial = 0, initialU = " "): PropInfoEntry => ({
    id:      key,
    type:    "float",
    key,
    label,
    default: initial,
    min:     0,
    step:    1,
    unit:    MakeUnitInfo(`${key}Unit`, "V", initialU),
});

export const AnalogPropInfo = MakeDefaultPropInfoGetter({
    "AnalogPort": DEFAULT_PORT_PROP_INFO,
    "AnalogWire": DEFAULT_WIRE_PROP_INFO,
    "AnalogNode": DEFAULT_COMPONENT_PROP_INFO,

    // Sources
    "VoltageSource": [
        ...DEFAULT_COMPONENT_PROP_INFO,
        {
            id:      "waveform",
            type:    "string[]",
            key:     "waveform",
            label:   "Waveform",
            default: "DC",
            options: [
                ["Const",  "DC"],
                ["Square", "DC PULSE"],
                ["Sine",   "DC SINE"],
            ],
        },
        { // Const-waveform props
            type:     "group",
            id:       "waveform-const",
            isActive: (props) => (props["waveform"].every((w) => (w === "DC"))),
            info:     [
                VoltageInfo("V", "Voltage", 5),
            ],
        },
        { // Pulse-waveform props
            type:     "group",
            id:       "waveform-pulse",
            isActive: (props) => (props["waveform"].every((w) => (w === "DC PULSE"))),
            info:     [
                VoltageInfo("v1", "Low Voltage", 0),
                VoltageInfo("V", "High Voltage", 5),
                TimeInfo("td", "Delay Time", 0),
                TimeInfo("tr", "Rise Time", 0.01),
                TimeInfo("tf", "Fall Time", 0.01),
                TimeInfo("pw", "Pulse Width", 0.1),
                TimeInfo("p", "Period", 0.2),
                AngleInfo("ph", "Phase", 0),
            ],
        },
        { // Sine-waveform props
            type:     "group",
            id:       "waveform-sine",
            isActive: (props) => (props["waveform"].every((w) => (w === "DC SINE"))),
            info:     [
                VoltageInfo("v1", "Offset Voltage", 0),
                VoltageInfo("V", "Amplitude Voltage", 5),
                FrequencyInfo("f", "Frequency", 5),
                TimeInfo("td", "Delay Time", 0),
                {
                    id:      "d",
                    type:    "float",
                    key:     "d",
                    label:   "Damping Factor",
                    default: 0,
                    min:     0,
                    step:    0.1,
                },
                AngleInfo("ph", "Phase", 0),
            ],
        },
    ],
    "CurrentSource": [
        ...DEFAULT_COMPONENT_PROP_INFO,
        {
            id:      "c",
            type:    "float",
            key:     "c",
            label:   "Current",
            default: 0.05,
            min:     0,
            step:    0.1,
            unit:    MakeUnitInfo("c", "\u03A9", "k"),
        },
    ],

    // Essentials
    "Ground":   DEFAULT_COMPONENT_PROP_INFO,
    "Resistor": [
        ...DEFAULT_COMPONENT_PROP_INFO,
        {
            id:      "R",
            type:    "float",
            key:     "R",
            label:   "Resistance",
            default: 1,
            min:     0,
            step:    0.1,
            unit:    MakeUnitInfo("unit", "\u03A9", "k"),
        },
    ],
    "Capacitor": [
        ...DEFAULT_COMPONENT_PROP_INFO,
        {
            id:      "C",
            type:    "float",
            key:     "C",
            label:   "Capacitance",
            default: 1,
            min:     0,
            step:    0.1,
            unit:    MakeUnitInfo("unit", "C", "u"),
        },
    ],
    "Inductor": [
        ...DEFAULT_COMPONENT_PROP_INFO,
        {
            id:      "L",
            type:    "float",
            key:     "L",
            label:   "Inductance",
            default: 10,
            min:     0,
            step:    1,
            unit:    MakeUnitInfo("unit", "L", "m"),
        },
    ],

    // Measurements
    "Oscilloscope": DEFAULT_COMPONENT_PROP_INFO,

    // Other
    "Label": [
        ...DEFAULT_COMPONENT_PROP_INFO,
        {
            id:      "bgColor",
            type:    "color",
            key:     "bgColor",
            label:   "Color",
            default: "#FFFFFF",
        },
        {
            id:      "textColor",
            type:    "color",
            key:     "textColor",
            label:   "Text Color",
            default: "#000000",
        },
    ],
})
