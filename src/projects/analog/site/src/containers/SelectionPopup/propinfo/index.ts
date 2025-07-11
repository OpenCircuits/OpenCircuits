import {MakeDefaultPropInfoGetter} from "shared/site/containers/SelectionPopup/propinfo/PropInfo";
import {DEFAULT_COMPONENT_PROP_INFO,
        DEFAULT_PORT_PROP_INFO,
        DEFAULT_WIRE_PROP_INFO} from "shared/site/containers/SelectionPopup/propinfo/DefaultPropInfo";


export const AnalogPropInfo = MakeDefaultPropInfoGetter({
    "AnalogPort": DEFAULT_PORT_PROP_INFO,
    "AnalogWire": DEFAULT_WIRE_PROP_INFO,
    "AnalogNode": DEFAULT_COMPONENT_PROP_INFO,

    // Sources
    "VoltageSource": DEFAULT_COMPONENT_PROP_INFO,
    "CurrentSource": DEFAULT_COMPONENT_PROP_INFO,

    // Essentials
    "Ground":    DEFAULT_COMPONENT_PROP_INFO,
    "Resistor":  DEFAULT_COMPONENT_PROP_INFO,
    "Capacitor": DEFAULT_COMPONENT_PROP_INFO,
    "Inductor":  DEFAULT_COMPONENT_PROP_INFO,

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
