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
    "ConstantNumber": DefaultComponentPropInfo,
    "Clock":          DefaultComponentPropInfo,

    // Outputs
    "LED":            DefaultComponentPropInfo,
    "SegmentDisplay": DefaultComponentPropInfo,
    "BCDDisplay":     DefaultComponentPropInfo,
    "ASCIIDisplay":   DefaultComponentPropInfo,
    "Oscilloscope":   DefaultComponentPropInfo,

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
