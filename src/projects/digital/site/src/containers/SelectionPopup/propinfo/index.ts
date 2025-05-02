import {PropInfoRecord} from "shared/site/containers/SelectionPopup/propinfo/PropInfo";
import {DefaultComponentPropInfo,
        DefaultPortPropInfo,
        DefaultWirePropInfo} from "shared/site/containers/SelectionPopup/propinfo/DefaultPropInfo";


export const DigitalPropInfo: PropInfoRecord = {
    "DigitalPort": DefaultPortPropInfo,
    "DigitalWire": DefaultWirePropInfo,
    "DigitalNode": DefaultComponentPropInfo,

    // Inputs
    "Button":         DefaultComponentPropInfo,
    "Switch":         DefaultComponentPropInfo,
    "ConstantLow":    DefaultComponentPropInfo,
    "ConstantHigh":   DefaultComponentPropInfo,
    "ConstantNumber": [
        ...DefaultComponentPropInfo,
        {
            id:      "inputNum",
            type:    "int",
            key:     "inputNum",
            label:   "Input Number",
            min:     0,
            max:     15,
            default: 0,
        },
    ],
    "Clock": [
        ...DefaultComponentPropInfo,
        {
            id:      "delay",
            type:    "int",
            key:     "delay",
            label:   "Delay",
            default: 250,
        },
    ],

    // Outputs
    "LED": [
        ...DefaultComponentPropInfo,
        {
            id:      "color",
            type:    "color",
            key:     "color",
            label:   "Color",
            default: "#FFFFFF",
        },
    ],
    "SegmentDisplay": DefaultComponentPropInfo,
    "BCDDisplay":     [
        ...DefaultComponentPropInfo,
        {
            id:      "segmentCount",
            type:    "number[]",
            key:     "segmentCount",
            label:   "Segment Count",
            options: [
                ["7", 7],
                ["9", 9],
                ["14", 14],
                ["16", 16],
            ],
            default: 7,
        },
    ],
    "ASCIIDisplay": [
        ...DefaultComponentPropInfo,
        {
            id:      "segmentCount",
            type:    "number[]",
            key:     "segmentCount",
            label:   "Segment Count",
            options: [
                ["7", 7],
                ["9", 9],
                ["14", 14],
                ["16", 16],
            ],
            default: 7,
        },
    ],
    "Oscilloscope": [
        ...DefaultComponentPropInfo,
        {
            id:      "samples",
            type:    "int",
            key:     "samples",
            label:   "Samples",
            min:     10,
            max:     400,
            default: 100,
        },
        {
            id:      "w",
            type:    "int",
            key:     "w",
            label:   "Display Size",
            min:     2,
            max:     20,
            default: 8,
        },
        {
            id:      "h",
            type:    "int",
            key:     "h",
            min:     1,
            max:     10,
            default: 4,
        },
    ],

    // Logic Gates
    "BUFGate":  DefaultComponentPropInfo,
    "NOTGate":  DefaultComponentPropInfo,
    "ANDGate":  DefaultComponentPropInfo,
    "NANDGate": DefaultComponentPropInfo,
    "ORGate":   DefaultComponentPropInfo,
    "NORGate":  DefaultComponentPropInfo,
    "XORGate":  DefaultComponentPropInfo,
    "XNORGate": DefaultComponentPropInfo,

    // Flip Flops
    "SRFlipFlop": DefaultComponentPropInfo,
    "JKFlipFlop": DefaultComponentPropInfo,
    "DFlipFlop":  DefaultComponentPropInfo,
    "TFlipFlop":  DefaultComponentPropInfo,

    // Latches
    "DLatch":  DefaultComponentPropInfo,
    "SRLatch": DefaultComponentPropInfo,

    // Latches
    "Multiplexer":   DefaultComponentPropInfo,
    "Demultiplexer": DefaultComponentPropInfo,
    "Encoder":       DefaultComponentPropInfo,
    "Decoder":       DefaultComponentPropInfo,
    "Comparator":    DefaultComponentPropInfo,
    "Label":         [
        ...DefaultComponentPropInfo,
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
} as const;
