import {PropInfoRecord} from "core/models/PropInfo";

import {AnalogObj} from "core/models/types/analog";

import {DefaultComponentPropInfo, DefaultPortPropInfo, DefaultWirePropInfo} from "core/views/DefaultPropInfo";


export const AnalogPropInfo: PropInfoRecord<AnalogObj> = {
    "AnalogPort": DefaultPortPropInfo,
    "AnalogWire": DefaultWirePropInfo,
    "AnalogNode": DefaultComponentPropInfo,

    "Resistor": {
        ...DefaultComponentPropInfo,
        "resistance": { type: "float", label: "Resistance", step: 100, min: 0 },
    },
    "Oscilloscope": {
        ...DefaultComponentPropInfo,
        "width": { type: "float", label: "Width", step: 10, min: 0 },
        "length": { type: "float", label: "Length", step: 10, min: 0 },
        "inputs": { type: "float", label: "Inputs", step: 1, min: 0, max: 8 },
        "delay": { type: "float", label: "Delay", step: 50, min: 0, max: 10000 },
        "samples": { type: "float", label: "Samples", step: 50, min: 0 },
    },
    
    "Ground": DefaultComponentPropInfo,
} as const;
