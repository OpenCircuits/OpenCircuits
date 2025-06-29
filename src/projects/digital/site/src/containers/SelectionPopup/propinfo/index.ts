import {MakeDefaultPropInfoGetter} from "shared/site/containers/SelectionPopup/propinfo/PropInfo";
import {DEFAULT_COMPONENT_PROP_INFO,
        DEFAULT_PORT_PROP_INFO,
        DEFAULT_WIRE_PROP_INFO} from "shared/site/containers/SelectionPopup/propinfo/DefaultPropInfo";


export const DigitalPropInfo = MakeDefaultPropInfoGetter({
    "DigitalPort": DEFAULT_PORT_PROP_INFO,
    "DigitalWire": DEFAULT_WIRE_PROP_INFO,
    "DigitalNode": DEFAULT_COMPONENT_PROP_INFO,

    // Inputs
    "Button":         DEFAULT_COMPONENT_PROP_INFO,
    "Switch":         DEFAULT_COMPONENT_PROP_INFO,
    "ConstantLow":    DEFAULT_COMPONENT_PROP_INFO,
    "ConstantHigh":   DEFAULT_COMPONENT_PROP_INFO,
    "ConstantNumber": [
        ...DEFAULT_COMPONENT_PROP_INFO,
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
        ...DEFAULT_COMPONENT_PROP_INFO,
        {
            id:      "delay",
            type:    "int",
            key:     "delay",
            label:   "Delay",
            default: 250,
            step:    10,
            min:     1,
            // MUST BE <= DigitalSim.MAX_QUEUE_AHEAD
            max:     10_000,
        },
    ],

    // Outputs
    "LED": [
        ...DEFAULT_COMPONENT_PROP_INFO,
        {
            id:      "color",
            type:    "color",
            key:     "color",
            label:   "Color",
            default: "#FFFFFF",
        },
    ],
    "SegmentDisplay": DEFAULT_COMPONENT_PROP_INFO,
    "BCDDisplay":     [
        ...DEFAULT_COMPONENT_PROP_INFO,
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
        ...DEFAULT_COMPONENT_PROP_INFO,
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
        ...DEFAULT_COMPONENT_PROP_INFO,
        {
            id:      "samples",
            type:    "int",
            key:     "samples",
            label:   "Samples",
            min:     10,
            max:     400,
            step:    10,
            default: 100,
        },
        {
            id:    "size",
            type:  "group",
            label: "Display Size",
            info:  [
                { id: "w", type: "int", key: "w", min: 2, max: 20, step: 1, default: 8 },
                { id: "h", type: "int", key: "h", min: 1, max: 10, step: 1, default: 4 },
            ],
        },
        {
            id:      "delay",
            type:    "int",
            key:     "delay",
            label:   "Delay",
            default: 50,
            step:    10,
            min:     1,
            // MUST BE <= DigitalSim.MAX_QUEUE_AHEAD
            max:     10_000,
        },
    ],

    // Logic Gates
    "BUFGate":  DEFAULT_COMPONENT_PROP_INFO,
    "NOTGate":  DEFAULT_COMPONENT_PROP_INFO,
    "ANDGate":  DEFAULT_COMPONENT_PROP_INFO,
    "NANDGate": DEFAULT_COMPONENT_PROP_INFO,
    "ORGate":   DEFAULT_COMPONENT_PROP_INFO,
    "NORGate":  DEFAULT_COMPONENT_PROP_INFO,
    "XORGate":  DEFAULT_COMPONENT_PROP_INFO,
    "XNORGate": DEFAULT_COMPONENT_PROP_INFO,

    // Flip Flops
    "SRFlipFlop": DEFAULT_COMPONENT_PROP_INFO,
    "JKFlipFlop": DEFAULT_COMPONENT_PROP_INFO,
    "DFlipFlop":  DEFAULT_COMPONENT_PROP_INFO,
    "TFlipFlop":  DEFAULT_COMPONENT_PROP_INFO,

    // Latches
    "DLatch":  DEFAULT_COMPONENT_PROP_INFO,
    "SRLatch": DEFAULT_COMPONENT_PROP_INFO,

    // Latches
    "Multiplexer":   DEFAULT_COMPONENT_PROP_INFO,
    "Demultiplexer": DEFAULT_COMPONENT_PROP_INFO,
    "Encoder":       DEFAULT_COMPONENT_PROP_INFO,
    "Decoder":       DEFAULT_COMPONENT_PROP_INFO,
    "Comparator":    DEFAULT_COMPONENT_PROP_INFO,
    "Label":         [
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
